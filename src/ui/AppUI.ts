import { SoundEngine } from '../audio/SoundEngine';
import { DEMO_SCENES } from '../engine/Demos';
import { SimulationEngine } from '../engine/SimulationEngine';
import { makeWire } from '../engine/Wires';
import { makeWheel, makeSpring, type WheelKind } from '../engine/MechanicalSystem';
import { deleteWorld, listWorlds, loadWorld, saveWorld, saveTemplate, listTemplates, getTemplate, deleteTemplate, placeTemplate, type Template } from '../engine/WorldStore';
import { ELEC_COND_LUT } from '../materials/registry';
import { ThermalSolver } from '../engine/ThermalSolver';
import { GpuPipeline } from '../gpu/GpuPipeline';
import {
  CATEGORIES,
  EXPANSION_SELECTABLE_IDS,
  MAT,
  MATERIAL_BY_ID,
  SELECTABLE_MATERIALS,
  XMAT,
} from '../materials/registry';
import { describeElement, ELEMENT_BY_ID } from '../materials/elementRegistry';
import {
  BoundaryMode,
  BrushShape,
  CategoryId,
  DisplayMode,
  FanDirection,
  GameSettings,
  MaterialDef,
} from '../types/physics';
import { getMaterialThumbnailUrl } from './ThumbnailRenderer';
import { WindCompass } from './WindCompass';
import { PIXPHYSO_LOGO_URI } from './logo';

export class AppUI {
  private settings: GameSettings = {
    computeMode: 'gpu90',
    substeps: 2,
    resolutionPreset: 'standard',
    hdrBloom: true,
    bloomIntensity: 0.72,
    realisticTextures: true,
    refractionAndSpec: true,
    heatShimmer: true,
    airVectorsOverlay: false,
    structuralStress: true,
    soundEnabled: true,
    soundVolume: 0.45,
    showCrosshairInfo: true,
  };

  private engine: SimulationEngine;
  private gpu!: GpuPipeline;
  private sound = new SoundEngine();
  private windCompass!: WindCompass;

  private selectedCategory: CategoryId = 'all';
  private searchQuery = '';
  private newOnly = false;
  private selectedMatId: number = MAT.SAND;
  private brushRadius = 5;
  private brushShape: BrushShape = 'circle';
  private replaceMode = false;
  private displayMode: DisplayMode = 'realistic';

  private simCanvas!: HTMLCanvasElement;
  private hudCanvas!: HTMLCanvasElement;
  private hudCtx!: CanvasRenderingContext2D;
  private hudScale = 1;
  private thumbnailObserver: IntersectionObserver | null = null;
  private thumbnailQueue: HTMLImageElement[] = [];
  private thumbnailFrame = 0;

  private queueThumbnail(img: HTMLImageElement): void {
    this.thumbnailQueue.push(img);
    if (this.thumbnailFrame) return;
    const next = () => {
      this.thumbnailFrame = 0;
      const current = this.thumbnailQueue.shift();
      if (current?.isConnected) current.src = getMaterialThumbnailUrl(MATERIAL_BY_ID[Number(current.dataset.mat)]);
      if (this.thumbnailQueue.length) this.thumbnailFrame = requestAnimationFrame(next);
    };
    this.thumbnailFrame = requestAnimationFrame(next);
  }
  private canvasWrap!: HTMLElement;
  private canvasFrame!: HTMLElement;

  // Pointer state
  private zoom = 1;
  private panX = 0;
  private panY = 0;
  private editMode: 'paint' | 'fill' | 'pick' | 'ruler' | 'rectangle' | 'ellipse' | 'template' = 'paint';
  private templateRegion: [[number, number], [number, number]] | null = null;
  private placingTemplate: Template | null = null;
  private measureStart: [number, number] | null = null;
  private mechanicalMode: WheelKind | 'spring' | 'remove' | null = null;
  private springStart: [number, number] | null = null;
  private wireMode = false;
  private wireStart: [number, number] | null = null;
  private wireTension = .5;
  private pointerDown = false;
  private pointerErase = false;
  private pointerInteractedSwitch = false;
  private pointerSimX = -1;
  private pointerSimY = -1;
  private prevSimX = -1;
  private prevSimY = -1;
  private lineStartX = -1;
  private lineStartY = -1;
  private shiftHeld = false;

  // Telemetry smoothing
  private fps = 60;
  private frameCounter = 0;
  private lastFpsStamp = performance.now();
  private smoothCpuMs = 0.8;
  private smoothGpuMs = 6.5;
  private particleCount = 0;

  // DOM refs for fast updates
  private probeEl!: HTMLElement;
  private telemetryEl!: HTMLElement;
  private computeBadgeEl!: HTMLElement;
  private itemsStripEl!: HTMLElement;
  private selectedBannerEl!: HTMLElement;
  private fanDirBarEl!: HTMLElement;
  private settingsModalEl!: HTMLElement;
  private exitModalEl!: HTMLElement;

  constructor(private root: HTMLElement) {
    this.engine = new SimulationEngine(this.settings);
    this.mountDOM();
    this.gpu = new GpuPipeline(this.simCanvas);
    this.fitCanvasViewport();

    // Load rich initial Physics Lab scene so user immediately sees real physics, density stratification & active electric circuit!
    DEMO_SCENES[0].build(this.engine.world);

    window.addEventListener('resize', () => this.fitCanvasViewport());
    this.bindKeyboard();
    this.startLoop();
  }

  private mountDOM(): void {
    this.root.innerHTML = `
      <div class="app-shell">
        <!-- TOP BAR (Single PIXPHYSO Icon + Transport + Game Settings + Exit) -->
        <header class="topbar">
          <div class="brand-group">
            <img src="${PIXPHYSO_LOGO_URI}" alt="PIXPHYSO" class="brand-logo" />
            <span class="brand-title">PIXPHYSO</span>
            <span class="compute-badge" id="computeBadge" title="Нажмите для настройки режима вычислений">
              GPU рендер · CPU физика
            </span>
          </div>

          <div class="transport-group">
            <button class="btn btn-primary" id="btnPlayPause">⏸ Пауза</button>
            <button class="btn" id="btnStep" title="Один физический шаг (F)">⏭ Шаг</button>
            <div class="speed-pill-bar" id="speedBar">
              <button class="speed-btn" data-spd="0.25">0,25×</button>
              <button class="speed-btn" data-spd="0.5">0,5×</button>
              <button class="speed-btn active" data-spd="1">1×</button>
              <button class="speed-btn" data-spd="2">2×</button>
              <button class="speed-btn" data-spd="4">4×</button>
            </div>
            <button class="btn" id="btnUndo" title="Отменить действие (Ctrl+Z)">↩ Отмена</button>
          </div>

          <div class="actions-group">
            ${
              typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol)
                ? `<a class="btn btn-primary" href="/PIXPHYSO-Release.zip" download="PIXPHYSO-Release.zip" style="text-decoration:none;" title="Скачать готовый архив игры для запуска на ПК без установки">⬇ Скачать .ZIP</a>`
                : ''
            }
            <button class="btn mobile-env" id="btnEnv">Среда</button>
            <button class="btn" id="btnWorlds">Миры</button>
            <button class="btn" id="btnCatalog">Каталог</button>
            <button class="btn btn-danger" id="btnClear">Очистить</button>
            <button class="btn" id="btnSettings">⚙ Настройки</button>
            <button class="btn" id="btnExit">Выход</button>
          </div>
        </header>

        <!-- MIDDLE WORKSPACE: Left Simulation Environment Bar + GPU Viewport -->
        <div class="workspace-middle">
          <aside class="env-sidebar">
            <button class="btn mobile-env" id="btnCloseEnv">✕ Закрыть среду</button>
            <div class="panel-section">
              <div class="section-title">
                <span>Среда симуляции</span>
                <span id="presetStatusLabel" style="color:#ffffff;font-size:10px;">УЛИЦА</span>
              </div>
              <div class="preset-tabs">
                <button class="preset-tab active" data-preset="street">Улица</button>
                <button class="preset-tab" data-preset="home">Дом</button>
                <button class="preset-tab" data-preset="custom">Свой</button>
              </div>

              <div class="ctrl-row">
                <div class="ctrl-label">
                  <span>Средняя температура</span>
                  <span class="ctrl-val" id="valAmbTemp">18 °C</span>
                </div>
                <input type="range" id="rngAmbTemp" min="-190" max="600" step="1" value="18" />
              </div>

              <div class="ctrl-row">
                <div class="ctrl-label">
                  <span>Влажность воздуха</span>
                  <span class="ctrl-val" id="valHumidity">62 %</span>
                </div>
                <input type="range" id="rngHumidity" min="0" max="100" step="1" value="62" />
              </div>

              <div class="ctrl-row">
                <div class="ctrl-label">
                  <span>Атм. давление</span>
                  <span class="ctrl-val" id="valPressure">101,3 кПа</span>
                </div>
                <input type="range" id="rngPressure" min="0.5" max="500" step="0.5" value="101.3" />
                <div class="sub-hint" id="boilHint">Кипение H₂O при этом давлении: 100.0 °C</div>
              </div>

              <div class="ctrl-row">
                <div class="ctrl-label">
                  <span>Гравитация</span>
                  <span class="ctrl-val" id="valGravity">9,81 м/с²</span>
                </div>
                <input type="range" id="rngGravity" min="-9.81" max="24.8" step="0.1" value="9.81" />
              </div>

              <button class="btn" id="btnResetEnv" style="width:100%;margin-top:2px;">
                Сбросить среду к пресету
              </button>
            </div>

            <!-- WIND SPEED & 360° DIRECTION COMPASS -->
            <div class="panel-section">
              <div class="section-title">
                <span>Ветер и направление</span>
                <span id="valWindAngle" style="color:#ffffff;">0° (Восток →)</span>
              </div>
              <div class="wind-box">
                <div id="windCompassMount"></div>
                <div style="display:flex;flex-direction:column;gap:5px;">
                  <div class="ctrl-label">
                    <span>Скорость</span>
                    <span class="ctrl-val" id="valWindSpeed">2,4 м/с</span>
                  </div>
                  <input type="range" id="rngWindSpeed" min="0" max="40" step="0.2" value="2.4" />
                  <div class="wind-quick-dirs">
                    <button class="mini-btn" data-wdir="180" title="Западный (влево)">←</button>
                    <button class="mini-btn" data-wdir="270" title="Восходящий поток">↑</button>
                    <button class="mini-btn" data-wdir="90" title="Нисходящий поток">↓</button>
                    <button class="mini-btn" data-wdir="0" title="Восточный (вправо)">→</button>
                  </div>
                  <label style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text-muted);cursor:pointer;">
                    <input type="checkbox" id="chkWindGusts" checked /> Порывы ветра
                  </label>
                </div>
              </div>
            </div>

            <div class="panel-section">
              <div class="section-title">Погода и скорость</div>
              <label class="toggle-row"><span>Скорость симуляции</span><select class="dark-select" id="selMobileSpeed" style="width:85px"><option value="0.25">0,25×</option><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label>
              <label class="toggle-row"><span>Осадки: дождь / снег по температуре</span><input type="checkbox" id="chkPrecipitation" /></label>
              <label class="toggle-row"><span>Гроза (при осадках)</span><input type="checkbox" id="chkStorm" /></label>
              <div class="sub-hint">Осадки появляются при открытом небе.</div>
            </div>

            <!-- DISPLAY FILTER & BOUNDARIES -->
            <div class="panel-section">
              <div class="section-title">Отображение и края</div>
              <div class="ctrl-row"><div class="ctrl-label"><span>Размер мира (изменение очищает поле)</span></div><select class="dark-select" id="selWorldSize"><option value="standard">480×270</option><option value="high">576×324</option><option value="ultra">680×382</option><option value="large">960×540</option></select></div>
              <div class="ctrl-row">
                <div class="ctrl-label"><span>Научный режим камеры</span></div>
                <div class="sub-hint">Переключатель режимов вынесен на отдельную панель прямо над полем — он всегда виден и не требует открывать настройки.</div>
              </div>
              <div class="ctrl-row">
                <div class="ctrl-label"><span>Границы поля</span></div>
                <select class="dark-select" id="selBoundary">
                  <option value="open_sky">Открытое небо (газы уходят вверх)</option>
                  <option value="closed">Герметичный бункер (замкнутый)</option>
                  <option value="open_all">Открытые края со всех сторон</option>
                </select>
              </div>
            </div>

            <!-- DEMO EXPERIMENTS -->
            <div class="panel-section">
              <div class="section-title">Физические стенды</div>
              <select class="dark-select" id="selDemoScene">
                ${DEMO_SCENES.map((d, idx) => `<option value="${idx}">${d.title}</option>`).join('')}
              </select>
              <div class="sub-hint" id="demoDescHint">${DEMO_SCENES[0].subtitle}</div>
              <button class="btn btn-primary" id="btnLoadDemo" style="width:100%;">
                Запустить стенд
              </button>
            </div>
          </aside>

          <!-- SIMULATION STAGE -->
          <main class="stage-area">
            <div class="display-mode-bar" id="displayModeBar" role="tablist" aria-label="Режим отображения">
              <span class="mode-label">Режим</span>
              <button class="mode-btn active" data-mode="realistic" role="tab" aria-selected="true" title="Реалистичный HDR: PBR-текстуры, преломление, тепловое свечение">◉ Реальный</button>
              <button class="mode-btn" data-mode="thermal" role="tab" aria-selected="false" title="Тепловизор FLIR: инфракрасный спектр температур">◍ Тепло</button>
              <button class="mode-btn" data-mode="pressure" role="tab" aria-selected="false" title="Давление и ударные волны, кПа">◎ Давление</button>
              <button class="mode-btn" data-mode="velocity" role="tab" aria-selected="false" title="Аэродинамика: векторы и потоки ветра">≋ Ветер</button>
              <button class="mode-btn" data-mode="electric" role="tab" aria-selected="false" title="Электрический потенциал, В / А">ϟ Ток</button>
              <button class="mode-btn" data-mode="stress" role="tab" aria-selected="false" title="Гидростатика и механическая нагрузка">▦ Нагрузка</button>
              <span class="mode-spacer"></span>
              <span class="mode-clock" id="modeClock" title="Симуляционное время: при 1× идёт секунда в секунду">t = 0,00 с · 1×</span>
            </div>
            <div class="canvas-wrap" id="canvasWrap">
              <div class="canvas-frame" id="canvasFrame">
                <canvas class="sim-canvas" id="simCanvas"></canvas>
                <canvas class="hud-canvas" id="hudCanvas"></canvas>
              </div>
            </div>
            <footer class="status-bar">
              <div class="probe-readout" id="probeReadout">
                ЛКМ — рисовать · ПКМ — ластик · Shift — линия · Пробел — пауза · F — шаг · Ctrl+Z — отмена · R — направление · N — новинки · Q/E — режимы · 0–7 — категории
              </div>
              <div class="telemetry-readout" id="telemetryReadout">
                CPU физика · GPU рендер
              </div>
            </footer>
          </main>
        </div>

        <!-- BOTTOM ITEM STRIP + RIGHT-CORNER CATEGORY MATRIX -->
        <section class="bottom-dock">
          <div class="items-column">
            <div class="brush-toolbar">
              <button class="mini-btn active" data-edit="paint">Кисть</button>
              <button class="mini-btn" data-edit="fill">Заливка</button>
              <button class="mini-btn" data-edit="pick">Пипетка</button>
              <button class="mini-btn" data-edit="ruler">Линейка</button>
              <button class="mini-btn" data-edit="rectangle">Прямоугольник</button>
              <button class="mini-btn" data-edit="ellipse">Эллипс</button>
              <select class="dark-select" id="selMechanical" style="width:165px;flex:0 0 165px" title="Колёса закреплены на осях. Двигатель ставьте на проводник, для зацепления расположите колёса вплотную.">
                <option value="">Механизмы…</option><option value="gear">Шестерня</option><option value="motor">Электродвигатель</option><option value="turbine">Водяная турбина</option><option value="crusher">Дробилка</option><option value="spring">Пружина</option><option value="remove">Удалить механизм</option>
              </select>
              <button class="mini-btn" data-edit="template" title="Выделить прямоугольную область для сохранения">Выделить схему</button>
              <button class="mini-btn" id="btnZoomReset">Масштаб 1×</button>
              <button class="mini-btn" id="btnWire" title="Две точки на проводниках">Кабель</button>
              <label class="brush-inline" title="Натяжение нового кабеля">Натяжение <input id="rngWire" type="range" min="0" max="100" value="50" style="width:70px" /></label>
              <button class="mini-btn" id="btnClearWires" title="Удалить все кабели">× кабели</button>
              <button class="mini-btn" id="btnNewOnly" title="Показать только 100 новых предметов (клавиша N)">+100 новых</button>
              <input
                type="text"
                class="search-input"
                id="inpSearch"
                placeholder="Поиск из ${SELECTABLE_MATERIALS.length} предметов..."
                aria-label="Поиск предмета"
              />
              <button class="mini-btn search-clear" id="btnClearSearch" title="Очистить поиск" aria-label="Очистить поиск">✕</button>

              <div class="brush-inline">
                <span>Кисть:</span>
                <input type="range" id="rngBrush" min="0" max="32" step="1" value="5" />
                <strong id="valBrush" style="color:#fff;min-width:22px;">5</strong>
              </div>

              <div class="brush-inline" id="shapeButtons">
                <button class="mini-btn active" data-shape="circle" title="Круглая кисть">● Круг</button>
                <button class="mini-btn" data-shape="square" title="Квадратный блок">■ Блок</button>
                <button class="mini-btn" data-shape="line" title="Прямая линия / стена / провод">╱ Линия</button>
                <button class="mini-btn" data-shape="spray" title="Распылитель">∷ Спрей</button>
              </div>

              <label class="brush-inline" style="cursor:pointer;">
                <input type="checkbox" id="chkReplace" />
                <span>Заменять</span>
              </label>

              <div class="brush-inline" id="fanDirBar" style="display:none;">
                <span style="color:#ffffff;font-weight:700;">Направление:</span>
                <button class="mini-btn active" data-fandir="0">→</button>
                <button class="mini-btn" data-fandir="1">↓</button>
                <button class="mini-btn" data-fandir="2">←</button>
                <button class="mini-btn" data-fandir="3">↑</button>
                <label title="Мощность новых вентиляторов">Мощность <input id="rngFanPower" type="range" min="10" max="100" value="100" style="width:70px" /></label>
              </div>

              <div class="selected-mat-banner" id="selectedBanner"></div>
            </div>

            <div class="items-strip" id="itemsStrip"></div>
          </div>

          <div class="category-corner" id="categoryCorner"></div>
        </section>
      </div>

      <div class="modal-backdrop hidden" id="worldsModal">
        <div class="modal-window" style="max-width:520px">
          <div class="modal-header"><div class="modal-title">Миры и схемы</div><button class="btn" id="btnCloseWorlds">✕ Закрыть</button></div>
          <div class="sub-hint">Сохранения и схемы хранятся локально в данных приложения. Чтобы выделить схему, выберите «Выделить схему» и проведите по полю.</div>
          <div style="display:flex;gap:6px;margin:12px 0"><input id="worldName" maxlength="60" placeholder="Имя сохранения" style="flex:1;min-width:0" /><button class="btn" id="btnSaveWorld">Мир</button><button class="btn" id="btnSaveTemplate">Схему</button></div>
          <div id="worldMessage" class="sub-hint"></div><div id="worldList" style="display:flex;flex-direction:column;gap:6px;max-height:25vh;overflow:auto"></div>
          <details style="margin-top:12px"><summary>Краткая справка и задания</summary><div class="sub-hint">Кабель: нажми две точки на проводниках. Диод, насос и клапан используют выбранное направление. Насосу и вентилятору нужно питание. Кислота + щёлочь → соль и тепло; сухой лёд → CO₂. Тепловизор и давление включаются в панели среды.</div><div id="guideMaterial" class="sub-hint"></div><div id="challengeList" class="sub-hint"></div></details>
        </div>
      </div>

      <!-- GAME SETTINGS MODAL -->
      <div class="modal-backdrop hidden" id="settingsModal">
        <div class="modal-window">
          <div class="modal-header">
            <div class="modal-title">Настройки игры и вычислительного движка</div>
            <button class="btn" id="btnCloseSettings">✕ Закрыть</button>
          </div>

          <div>
            <div class="section-title" style="margin-bottom:8px;">
              Режим вычислений
            </div>
            <div class="compute-cards">
              <div class="compute-card active" data-cmode="gpu90">
                <div class="compute-card-title">Приоритет GPU</div>
                <div class="sub-hint">
                  Физика рассчитывается процессором; графика и эффекты — видеокартой.
                </div>
                
              </div>
              <div class="compute-card" data-cmode="balance70">
                <div class="compute-card-title">Режим «Баланс»</div>
                <div class="sub-hint">
                  Увеличивает число итераций аэродинамики, электроцепей и теплообмена на CPU.
                </div>
                
              </div>
            </div>
            <div class="sub-hint" id="gpuHardwareInfo" style="margin-top:6px;color:#ffffff;"></div>
          </div>

          <div class="settings-grid">
            <div class="toggle-row">
              <span>Разрешение физического поля</span>
              <select class="dark-select" id="selResolution" style="width:155px;">
                <option value="standard">Стандарт (480×270)</option>
                <option value="high">Высокое (576×324)</option>
                <option value="ultra">Ультра (680×382)</option>
              </select>
            </div>

            <div class="toggle-row">
              <span>Подшаги физики за кадр: <strong id="valSubsteps">2</strong></span>
              <input type="range" id="rngSubsteps" min="1" max="6" step="1" value="2" style="width:110px;" />
            </div>

            <label class="toggle-row" style="cursor:pointer;">
              <span>PBR микро-текстуры материалов</span>
              <input type="checkbox" id="chkTextures" checked />
            </label>

            <label class="toggle-row" style="cursor:pointer;">
              <span>HDR свечение плазмы и металла (Bloom)</span>
              <input type="checkbox" id="chkBloom" checked />
            </label>

            <label class="toggle-row" style="cursor:pointer;">
              <span>Преломление стекла и блики воды</span>
              <input type="checkbox" id="chkSpec" checked />
            </label>

            <label class="toggle-row" style="cursor:pointer;">
              <span>Тепловое марево горячего воздуха</span>
              <input type="checkbox" id="chkShimmer" checked />
            </label>

            <label class="toggle-row" style="cursor:pointer;">
              <span>Векторы ветра поверх поля</span>
              <input type="checkbox" id="chkVectors" />
            </label>

            <label class="toggle-row" style="cursor:pointer;">
              <span>Звуковой синтез взрывов и дуг</span>
              <input type="checkbox" id="chkSound" checked />
            </label>
          </div>
        </div>
      </div>

      <!-- EXIT / SAVE / EXPORT MODAL -->
      <div class="modal-backdrop hidden" id="exitModal">
        <div class="modal-window" style="max-width:460px;">
          <div class="modal-header">
            <div class="modal-title">Меню PIXPHYSO</div>
            <button class="btn" id="btnCloseExit">✕ Назад в игру</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:9px;">
            ${
              typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol)
                ? `<a class="btn btn-primary" href="/PIXPHYSO-Release.zip" download="PIXPHYSO-Release.zip" style="height:38px;text-decoration:none;">
                    📦 Скачать готовую игру архивом (PIXPHYSO-Release.zip)
                   </a>
                   <a class="btn" href="/PIXPHYSO.html" download="PIXPHYSO.html" style="height:38px;text-decoration:none;">
                    🚀 Скачать одним файлом (PIXPHYSO.html — двойной клик)
                   </a>`
                : ''
            }
            <button class="btn" id="btnSavePng" style="height:38px;">
              📸 Сохранить HD-скриншот симуляции (.PNG)
            </button>
            <button class="btn" id="btnExportSave" style="height:38px;">
              💾 Экспортировать мир в файл (.pixphyso.json)
            </button>
            <label class="btn" style="height:38px;cursor:pointer;">
              📂 Загрузить сохранённый мир из файла
              <input type="file" id="inpImportSave" accept=".json" style="display:none;" />
            </label>
            <button class="btn btn-danger" id="btnResetLab" style="height:38px;">
              🔄 Сбросить всё и вернуться к стартовой лаборатории
            </button>
          </div>
        </div>
      </div>
    `;

    this.simCanvas = this.root.querySelector('#simCanvas')!;
    this.hudCanvas = this.root.querySelector('#hudCanvas')!;
    this.hudCtx = this.hudCanvas.getContext('2d')!;
    this.canvasWrap = this.root.querySelector('#canvasWrap')!;
    this.canvasFrame = this.root.querySelector('#canvasFrame')!;

    this.probeEl = this.root.querySelector('#probeReadout')!;
    this.telemetryEl = this.root.querySelector('#telemetryReadout')!;
    this.computeBadgeEl = this.root.querySelector('#computeBadge')!;
    this.itemsStripEl = this.root.querySelector('#itemsStrip')!;
    this.selectedBannerEl = this.root.querySelector('#selectedBanner')!;
    this.fanDirBarEl = this.root.querySelector('#fanDirBar')!;
    this.settingsModalEl = this.root.querySelector('#settingsModal')!;
    this.exitModalEl = this.root.querySelector('#exitModal')!;

    const compassMount = this.root.querySelector('#windCompassMount') as HTMLElement;
    this.windCompass = new WindCompass(
      compassMount,
      this.engine.world.env.windAngleDeg,
      this.engine.world.env.windSpeed,
      (deg) => {
        this.engine.world.env.windAngleDeg = deg;
        this.markCustomPreset();
        this.syncEnvironmentUI();
      }
    );

    this.renderCategories();
    this.renderItemsStrip();
    this.syncEnvironmentUI();
    this.bindControls();
    this.bindCanvasInput();
  }

  private fitCanvasViewport(): void {
    const w = this.engine.world.width;
    const h = this.engine.world.height;

    this.simCanvas.width = w * 2;
    this.simCanvas.height = h * 2;
    const rect = this.canvasWrap.getBoundingClientRect();
    const availW = Math.max(1, rect.width - 4);
    const availH = Math.max(1, rect.height - 4);
    const aspect = w / h;

    let dispW = availW;
    let dispH = dispW / aspect;
    if (dispH > availH) {
      dispH = availH;
      dispW = dispH * aspect;
    }

    this.canvasFrame.style.width = `${Math.floor(dispW)}px`;
    this.canvasFrame.style.height = `${Math.floor(dispH)}px`;
    this.hudScale = Math.min(2, window.devicePixelRatio || 1);
    this.hudCanvas.width = Math.max(1, Math.floor(dispW * this.hudScale));
    this.hudCanvas.height = Math.max(1, Math.floor(dispH * this.hudScale));
  }

  private renderCategories(): void {
    const corner = this.root.querySelector('#categoryCorner')!;
    corner.innerHTML = '';

    for (const cat of CATEGORIES) {
      const count =
        cat.id === 'all'
          ? SELECTABLE_MATERIALS.length
          : SELECTABLE_MATERIALS.filter((m) => m.category === cat.id).length;

      const btn = document.createElement('button');
      btn.className = `cat-btn ${this.selectedCategory === cat.id ? 'active' : ''}`;
      btn.innerHTML = `
        <span>${cat.shortLabel}</span>
        <span class="cat-count">${count}</span>
      `;
      btn.addEventListener('click', () => {
        this.selectedCategory = cat.id;
        this.renderCategories();
        this.renderItemsStrip();
      });
      corner.appendChild(btn);
    }
  }

  /** Краткая физическая карточка вещества для подсказки и строки выбранного предмета. */
  private materialFacts(def: MaterialDef): string {
    const parts: string[] = [];
    if (def.density > 0) parts.push(`${def.density} кг/м³`);
    if (def.meltTempC !== undefined) parts.push(`плавл. ${def.meltTempC} °C`);
    if (def.boilTempC !== undefined) parts.push(`кип. ${def.boilTempC} °C`);
    if (def.freezeTempC !== undefined) parts.push(`замерз. ${def.freezeTempC} °C`);
    if (def.flammability > 0) parts.push(`горючесть ${Math.round(def.flammability * 100)} %`);
    if (def.elecCond > 0) parts.push(`проводимость ${Math.round(def.elecCond * 100)} %`);
    if (def.tensileStrength > 0) parts.push(`прочность ${def.tensileStrength} кПа`);
    return parts.join(' · ');
  }

  private toggleNewOnly(): void {
    this.newOnly = !this.newOnly;
    const btn = this.root.querySelector('#btnNewOnly') as HTMLButtonElement;
    btn.classList.toggle('active', this.newOnly);
    btn.textContent = this.newOnly ? 'Все предметы' : '+100 новых';
    this.renderItemsStrip();
  }

  private renderItemsStrip(): void {
    const q = this.searchQuery.trim().toLowerCase();
    const filtered = SELECTABLE_MATERIALS.filter((m) => {
      if (this.selectedCategory !== 'all' && m.category !== this.selectedCategory) return false;
      if (this.newOnly && !EXPANSION_SELECTABLE_IDS.has(m.id)) return false;
      if (q && !m.name.toLowerCase().includes(q) && !m.shortDesc.toLowerCase().includes(q)) return false;
      return true;
    });

    const searchInput = this.root.querySelector('#inpSearch') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.placeholder = `Поиск из ${SELECTABLE_MATERIALS.length} · показано ${filtered.length}`;
    }

    this.thumbnailObserver?.disconnect();
    if (this.thumbnailFrame) cancelAnimationFrame(this.thumbnailFrame);
    this.thumbnailFrame = 0;
    this.thumbnailQueue = [];
    this.thumbnailObserver = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const img = entry.target as HTMLImageElement;
        this.queueThumbnail(img);
        this.thumbnailObserver?.unobserve(img);
      }
    }, { root: this.itemsStripEl, rootMargin: '100px' });
    this.itemsStripEl.innerHTML = '';
    for (const def of filtered) {
      const isNew = EXPANSION_SELECTABLE_IDS.has(def.id);
      const card = document.createElement('button');
      card.className = `item-card ${def.id === this.selectedMatId ? 'active' : ''} ${isNew ? 'is-new' : ''}`;
      const facts = this.materialFacts(def);
      // Подсказка собирается из собственного файла элемента: характеристики,
      // реакции, мод-владелец. Никаких данных, зашитых в интерфейсе.
      const element = ELEMENT_BY_ID[def.id];
      const details = describeElement(def.id);
      card.title = `${def.name}\n${def.shortDesc}${facts ? `\n${facts}` : ''}` +
        (element ? `\n${element.mod} · ${element.tags.join(', ')}${details ? `\n${details}` : ''}` : '');


      const subText =
        def.state === 'tool'
          ? 'Инструмент'
          : def.state === 'energy'
          ? 'Энергия'
          : def.density >= 10
          ? `${Math.round(def.density)} кг/м³`
          : `${def.density} кг/м³`;

      card.innerHTML = `
        <img class="item-thumb" data-mat="${def.id}" alt="" draggable="false" />
        ${isNew ? '<span class="item-new">NEW</span>' : ''}
        <div class="item-meta">
          <div class="item-name">${def.name}</div>
          <div class="item-sub">${subText}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectMaterial(def.id);
      });
      this.itemsStripEl.appendChild(card);
      const img = card.querySelector('img')!;
      if (this.thumbnailObserver) this.thumbnailObserver.observe(img);
      else img.src = getMaterialThumbnailUrl(def);
    }

    this.updateSelectedBanner();
  }

  private selectMaterial(matId: number): void {
    this.selectedMatId = matId;
    this.fanDirBarEl.style.display = [MAT.FAN, MAT.PUMP, MAT.VALVE, MAT.DIODE, MAT.RELAY, MAT.COMPRESSOR, MAT.VACUUM_PUMP].some(id => id === matId) ? 'flex' : 'none';
    this.renderItemsStrip();
  }

  private static readonly MODE_ORDER: DisplayMode[] = [
    'realistic', 'thermal', 'pressure', 'velocity', 'electric', 'stress',
  ];

  /** Единая точка переключения: синхронизирует панель, GPU и подсказки. */
  private setDisplayMode(mode: DisplayMode): void {
    if (!AppUI.MODE_ORDER.includes(mode)) return;
    this.displayMode = mode;
    this.root.querySelectorAll<HTMLButtonElement>('#displayModeBar [data-mode]').forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  private cycleDisplayMode(delta: number): void {
    const i = AppUI.MODE_ORDER.indexOf(this.displayMode);
    this.setDisplayMode(AppUI.MODE_ORDER[(i + delta + AppUI.MODE_ORDER.length) % AppUI.MODE_ORDER.length]);
  }

  private updateSelectedBanner(): void {
    const def = MATERIAL_BY_ID[this.selectedMatId];
    const facts = this.materialFacts(def);
    this.selectedBannerEl.textContent = `${def.name}: ${def.shortDesc}${facts ? `  ·  ${facts}` : ''}`;
  }

  private markCustomPreset(): void {
    this.engine.world.env.preset = 'custom';
  }

  private windDirectionName(deg: number): string {
    const d = ((deg % 360) + 360) % 360;
    if (d >= 337 || d < 23) return `${d}° (Восток →)`;
    if (d < 68) return `${d}° (ЮВ ↘)`;
    if (d < 113) return `${d}° (Вниз ↓)`;
    if (d < 158) return `${d}° (ЮЗ ↙)`;
    if (d < 203) return `${d}° (Запад ←)`;
    if (d < 248) return `${d}° (СЗ ↖)`;
    if (d < 293) return `${d}° (Вверх ↑)`;
    return `${d}° (СВ ↗)`;
  }

  private syncEnvironmentUI(): void {
    const env = this.engine.world.env;

    this.root.querySelectorAll<HTMLButtonElement>('.preset-tab').forEach((b) => {
      b.classList.toggle('active', b.dataset.preset === env.preset);
    });

    const presetLabel = this.root.querySelector('#presetStatusLabel')!;
    presetLabel.textContent =
      env.preset === 'street' ? 'УЛИЦА' : env.preset === 'home' ? 'ДОМ' : 'СВОЙ РЕЖИМ';

    (this.root.querySelector('#rngAmbTemp') as HTMLInputElement).value = String(env.ambientTempC);
    this.root.querySelector('#valAmbTemp')!.textContent = `${env.ambientTempC} °C`;

    (this.root.querySelector('#rngHumidity') as HTMLInputElement).value = String(env.humidity);
    this.root.querySelector('#valHumidity')!.textContent = `${env.humidity} %`;

    (this.root.querySelector('#rngPressure') as HTMLInputElement).value = String(env.pressureKPa);
    this.root.querySelector('#valPressure')!.textContent = `${env.pressureKPa.toFixed(1).replace('.', ',')} кПа`;

    const boilH2O = ThermalSolver.boilingPointAtPressure(100, env.pressureKPa);
    this.root.querySelector('#boilHint')!.textContent = `Кипение H₂O при этом давлении: ${boilH2O.toFixed(1)} °C`;

    (this.root.querySelector('#rngGravity') as HTMLInputElement).value = String(env.gravity);
    this.root.querySelector('#valGravity')!.textContent = `${env.gravity.toFixed(2).replace('.', ',')} м/с²`;

    (this.root.querySelector('#rngWindSpeed') as HTMLInputElement).value = String(env.windSpeed);
    this.root.querySelector('#valWindSpeed')!.textContent = `${env.windSpeed.toFixed(1).replace('.', ',')} м/с`;
    this.root.querySelector('#valWindAngle')!.textContent = this.windDirectionName(env.windAngleDeg);

    (this.root.querySelector('#chkWindGusts') as HTMLInputElement).checked = env.windGusts;
    (this.root.querySelector('#chkPrecipitation') as HTMLInputElement).checked = env.precipitation;
    (this.root.querySelector('#chkStorm') as HTMLInputElement).checked = env.storm;
    (this.root.querySelector('#selBoundary') as HTMLSelectElement).value = env.boundary;

    this.windCompass.setValues(env.windAngleDeg, env.windSpeed);
  }

  private bindControls(): void {
    // Horizontal wheel scroll on bottom items strip
    this.itemsStripEl.addEventListener(
      'wheel',
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          this.itemsStripEl.scrollLeft += e.deltaY;
        }
      },
      { passive: false }
    );

    const btnPlayPause = this.root.querySelector('#btnPlayPause') as HTMLButtonElement;
    const syncPlayBtn = () => {
      btnPlayPause.textContent = this.engine.paused ? '▶ Старт' : '⏸ Пауза';
      btnPlayPause.classList.toggle('btn-primary', !this.engine.paused);
    };
    btnPlayPause.addEventListener('click', () => {
      this.engine.paused = !this.engine.paused;
      syncPlayBtn();
    });

    this.root.querySelector('#btnStep')!.addEventListener('click', () => {
      this.engine.paused = true;
      syncPlayBtn();
      this.engine.stepFrame(this.settings, true);
    });

    this.root.querySelectorAll<HTMLButtonElement>('#speedBar .speed-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.engine.speedMultiplier = Number(btn.dataset.spd || '1');
        (this.root.querySelector('#selMobileSpeed') as HTMLSelectElement).value = String(this.engine.speedMultiplier);
        this.root.querySelectorAll('#speedBar .speed-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    this.root.querySelector('#selMobileSpeed')!.addEventListener('change', e => {
      const value = Number((e.target as HTMLSelectElement).value); this.engine.speedMultiplier = value;
      this.root.querySelectorAll<HTMLButtonElement>('#speedBar .speed-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.spd) === value));
    });

    this.root.querySelector('#btnUndo')!.addEventListener('click', () => {
      this.engine.world.popUndo();
    });

    this.root.querySelector('#btnClear')!.addEventListener('click', () => {
      this.engine.world.clear();
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(button => button.addEventListener('click', () => {
      this.editMode = button.dataset.edit as typeof this.editMode; this.measureStart = null; this.placingTemplate = null; this.mechanicalMode = null; this.springStart = null;
      (this.root.querySelector('#selMechanical') as HTMLSelectElement).value = ''; this.wireMode = false; this.wireStart = null;
      this.root.querySelector('#btnWire')!.classList.remove('active');
      this.root.querySelectorAll('[data-edit]').forEach(b => b.classList.remove('active')); button.classList.add('active');
    }));
    this.root.querySelector('#btnCatalog')!.addEventListener('click', () => { this.root.querySelector('.app-shell')!.classList.toggle('catalog-collapsed'); requestAnimationFrame(() => this.fitCanvasViewport()); });
    this.root.querySelector('#btnZoomReset')!.addEventListener('click', () => { this.zoom = 1; this.panX = this.panY = 0; this.applyCamera(); });
    this.root.querySelector('#selMechanical')!.addEventListener('change', e => {
      const value = (e.target as HTMLSelectElement).value;
      this.mechanicalMode = value ? value as WheelKind | 'spring' | 'remove' : null;
      this.springStart = null; this.wireMode = false; this.wireStart = null; this.editMode = 'paint';
      this.root.querySelector('#btnWire')!.classList.remove('active');
      this.root.querySelectorAll('[data-edit]').forEach(b => b.classList.remove('active'));
      if (!value) this.root.querySelector('[data-edit="paint"]')!.classList.add('active');
    });
    this.root.querySelector('#btnWire')!.addEventListener('click', () => {
      this.wireMode = !this.wireMode; this.wireStart = null; this.mechanicalMode = null; this.springStart = null;
      (this.root.querySelector('#selMechanical') as HTMLSelectElement).value = '';
      if (this.wireMode) { this.editMode = 'paint'; this.root.querySelectorAll('[data-edit]').forEach(b => b.classList.remove('active')); }
      this.root.querySelector('#btnWire')!.classList.toggle('active', this.wireMode);
      this.probeEl.textContent = this.wireMode ? 'Кабель: выберите две точки на проводниках' : '';
    });
    this.root.querySelector('#rngWire')!.addEventListener('input', e => { this.wireTension = Number((e.target as HTMLInputElement).value) / 100; });
    this.root.querySelector('#btnClearWires')!.addEventListener('click', () => { this.engine.world.pushUndo(); this.engine.world.wires = []; this.wireStart = null; });
    for (const [id, key] of [['chkPrecipitation','precipitation'], ['chkStorm','storm']] as const) {
      this.root.querySelector('#' + id)!.addEventListener('change', e => { this.engine.world.env[key] = (e.target as HTMLInputElement).checked; this.markCustomPreset(); });
    }
    const modal = this.root.querySelector('#worldsModal') as HTMLElement;
    const message = this.root.querySelector('#worldMessage') as HTMLElement;
    const list = this.root.querySelector('#worldList') as HTMLElement;
    const refresh = async () => {
      list.replaceChildren();
      try {
        const saves = await listWorlds(); message.textContent = saves.length ? '' : 'Сохранений пока нет.';
        for (const save of saves) {
          const row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;gap:6px';
          const label = document.createElement('span'); label.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis'; label.textContent = save.name;
          label.title = new Date(save.date).toLocaleString();
          const load = document.createElement('button'); load.className = 'btn'; load.textContent = 'Загрузить';
          load.onclick = async () => { try { await loadWorld(this.engine.world, save.name); this.fitCanvasViewport(); this.syncEnvironmentUI(); modal.classList.add('hidden'); } catch (e) { message.textContent = 'Ошибка загрузки: ' + String(e); } };
          const del = document.createElement('button'); del.className = 'btn'; del.textContent = '×'; del.title = 'Удалить сохранение';
          del.onclick = async () => { if (!window.confirm('Удалить сохранение «' + save.name + '»?')) return; try { await deleteWorld(save.name); await refresh(); } catch (e) { message.textContent = 'Ошибка удаления: ' + String(e); } };
          row.append(label, load, del); list.appendChild(row);
        }
        const templates = await listTemplates();
        for (const entry of templates) {
          const row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;gap:6px';
          const label = document.createElement('span'); label.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis'; label.textContent = 'Схема: ' + entry.name;
          const insert = document.createElement('button'); insert.className = 'btn'; insert.textContent = 'Вставить';
          insert.onclick = async () => { try { this.placingTemplate = await getTemplate(entry.name); this.wireMode = false; this.editMode = 'paint'; modal.classList.add('hidden'); (this.root.querySelector('#btnWorlds') as HTMLElement).textContent = 'Укажи место'; } catch(e) { message.textContent = 'Ошибка схемы: ' + String(e); } };
          const del = document.createElement('button'); del.className = 'btn'; del.textContent = '×'; del.title = 'Удалить схему';
          del.onclick = async () => { if (!window.confirm('Удалить схему «' + entry.name + '»?')) return; try { await deleteTemplate(entry.name); await refresh(); } catch(e) { message.textContent = 'Ошибка удаления: ' + String(e); } };
          row.append(label, insert, del); list.appendChild(row);
        }
        if (templates.length) message.textContent = '';
        const selected = MATERIAL_BY_ID[this.selectedMatId];
        this.root.querySelector('#guideMaterial')!.textContent = `Выбрано: ${selected.name}. ${selected.shortDesc}`;
        const world = this.engine.world; let water = false, lamp = false, hot = false;
        for (let i=0; i<world.size; i++) { water ||= world.mat[i] === MAT.WATER; lamp ||= world.mat[i] === MAT.LAMP && world.volt[i] > 4; hot ||= world.temp[i] > 100; if (water && lamp && hot) break; }
        this.root.querySelector('#challengeList')!.textContent = `Задания сейчас: ${water ? '☑' : '□'} разместить воду · ${lamp ? '☑' : '□'} зажечь лампу · ${hot ? '☑' : '□'} нагреть вещество выше 100 °C`;
      } catch (e) { message.textContent = 'Хранилище недоступно: ' + String(e); }
    };
    this.root.querySelector('#btnWorlds')!.addEventListener('click', () => { modal.classList.remove('hidden'); void refresh(); });
    this.root.querySelector('#btnCloseWorlds')!.addEventListener('click', () => modal.classList.add('hidden'));
    this.root.querySelector('#btnSaveWorld')!.addEventListener('click', async () => {
      const name = (this.root.querySelector('#worldName') as HTMLInputElement).value.trim();
      if (!name) { message.textContent = 'Введите имя сохранения.'; return; }
      try { const existing = await listWorlds(); if (existing.some(s => s.name === name) && !window.confirm('Перезаписать «' + name + '»?')) return; await saveWorld(this.engine.world, name); await refresh(); message.textContent = 'Сохранено.'; }
      catch (e) { message.textContent = 'Ошибка сохранения: ' + String(e); }
    });

    this.root.querySelector('#btnSaveTemplate')!.addEventListener('click', async () => {
      const name = (this.root.querySelector('#worldName') as HTMLInputElement).value.trim();
      if (!name) { message.textContent = 'Введите имя схемы.'; return; }
      if (!this.templateRegion) { message.textContent = 'Сначала выделите область кнопкой «Выделить схему».'; return; }
      try { const existing = await listTemplates(); if (existing.some(s => s.name === name) && !window.confirm('Перезаписать схему «' + name + '»?')) return;
        await saveTemplate(this.engine.world, name, this.templateRegion[0], this.templateRegion[1]); this.templateRegion = null; await refresh(); message.textContent = 'Схема сохранена.';
      } catch (e) { message.textContent = 'Ошибка сохранения схемы: ' + String(e); }
    });

    // Environment Presets & Sliders
    this.root.querySelectorAll<HTMLButtonElement>('.preset-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const p = tab.dataset.preset as 'street' | 'home' | 'custom';
        if (p === 'street' || p === 'home') {
          this.engine.world.applyPreset(p);
        } else {
          this.engine.world.env.preset = 'custom';
        }
        this.syncEnvironmentUI();
      });
    });

    this.root.querySelector('#btnResetEnv')!.addEventListener('click', () => {
      this.engine.world.resetEnvironment();
      this.syncEnvironmentUI();
    });

    this.root.querySelector('#rngAmbTemp')!.addEventListener('input', (e) => {
      this.engine.world.env.ambientTempC = Number((e.target as HTMLInputElement).value);
      this.markCustomPreset();
      this.syncEnvironmentUI();
    });

    this.root.querySelector('#rngHumidity')!.addEventListener('input', (e) => {
      this.engine.world.env.humidity = Number((e.target as HTMLInputElement).value);
      this.markCustomPreset();
      this.syncEnvironmentUI();
    });

    this.root.querySelector('#rngPressure')!.addEventListener('input', (e) => {
      this.engine.world.env.pressureKPa = Number((e.target as HTMLInputElement).value);
      this.markCustomPreset();
      this.syncEnvironmentUI();
    });

    this.root.querySelector('#rngGravity')!.addEventListener('input', (e) => {
      this.engine.world.env.gravity = Number((e.target as HTMLInputElement).value);
      this.markCustomPreset();
      this.syncEnvironmentUI();
    });

    this.root.querySelector('#rngWindSpeed')!.addEventListener('input', (e) => {
      this.engine.world.env.windSpeed = Number((e.target as HTMLInputElement).value);
      this.markCustomPreset();
      this.syncEnvironmentUI();
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-wdir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.engine.world.env.windAngleDeg = Number(btn.dataset.wdir);
        if (this.engine.world.env.windSpeed < 1) {
          this.engine.world.env.windSpeed = 8.0;
        }
        this.markCustomPreset();
        this.syncEnvironmentUI();
      });
    });

    this.root.querySelector('#chkWindGusts')!.addEventListener('change', (e) => {
      this.engine.world.env.windGusts = (e.target as HTMLInputElement).checked;
      this.markCustomPreset();
      this.syncEnvironmentUI();
    });

    const modeBar = this.root.querySelector('#displayModeBar')!;
    modeBar.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => this.setDisplayMode(btn.dataset.mode as DisplayMode));
    });

    this.root.querySelector('#selBoundary')!.addEventListener('change', (e) => {
      this.engine.world.env.boundary = (e.target as HTMLSelectElement).value as BoundaryMode;
      this.markCustomPreset();
      this.syncEnvironmentUI();
    });

    // Demo Scenes
    const selDemo = this.root.querySelector('#selDemoScene') as HTMLSelectElement;
    const demoHint = this.root.querySelector('#demoDescHint')!;
    selDemo.addEventListener('change', () => {
      const scene = DEMO_SCENES[Number(selDemo.value)];
      if (scene) demoHint.textContent = scene.subtitle;
    });
    this.root.querySelector('#btnLoadDemo')!.addEventListener('click', () => {
      const scene = DEMO_SCENES[Number(selDemo.value)];
      if (scene) {
        this.engine.world.pushUndo();
        scene.build(this.engine.world);
      }
    });

    // Search & Brush toolbar
    this.root.querySelector('#inpSearch')!.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.renderItemsStrip();
    });
    const newOnlyBtn = this.root.querySelector('#btnNewOnly') as HTMLButtonElement;
    newOnlyBtn.addEventListener('click', () => this.toggleNewOnly());
    this.root.querySelector('#btnClearSearch')!.addEventListener('click', () => {
      (this.root.querySelector('#inpSearch') as HTMLInputElement).value = '';
      this.searchQuery = '';
      this.renderItemsStrip();
    });

    const rngBrush = this.root.querySelector('#rngBrush') as HTMLInputElement;
    const valBrush = this.root.querySelector('#valBrush')!;
    rngBrush.addEventListener('input', () => {
      this.brushRadius = Number(rngBrush.value);
      valBrush.textContent = String(this.brushRadius);
    });

    this.root.querySelectorAll<HTMLButtonElement>('#shapeButtons [data-shape]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.brushShape = btn.dataset.shape as BrushShape;
        this.root.querySelectorAll('#shapeButtons [data-shape]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    this.root.querySelector('#chkReplace')!.addEventListener('change', (e) => {
      this.replaceMode = (e.target as HTMLInputElement).checked;
    });

    this.root.querySelectorAll<HTMLButtonElement>('#fanDirBar [data-fandir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.engine.world.activeFanDir = Number(btn.dataset.fandir) as FanDirection;
        this.root.querySelectorAll('#fanDirBar [data-fandir]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    this.root.querySelector('#rngFanPower')!.addEventListener('input', e => { this.engine.world.activeFanPower = Number((e.target as HTMLInputElement).value) / 100; });

    // Game Settings Modal
    const openSettings = () => {
      this.root.querySelector('#gpuHardwareInfo')!.textContent = `Активный графический ускоритель: ${this.gpu.rendererName}`;
      this.settingsModalEl.classList.remove('hidden');
    };
    this.root.querySelector('#btnSettings')!.addEventListener('click', openSettings);
    this.computeBadgeEl.addEventListener('click', openSettings);
    this.root.querySelector('#btnCloseSettings')!.addEventListener('click', () => {
      this.settingsModalEl.classList.add('hidden');
    });
    this.settingsModalEl.addEventListener('click', (e) => {
      if (e.target === this.settingsModalEl) this.settingsModalEl.classList.add('hidden');
    });

    this.root.querySelectorAll<HTMLElement>('[data-cmode]').forEach((card) => {
      card.addEventListener('click', () => {
        this.settings.computeMode = card.dataset.cmode as 'gpu90' | 'balance70';
        this.root.querySelectorAll('[data-cmode]').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
      });
    });

    for (const id of ['selResolution', 'selWorldSize']) this.root.querySelector('#' + id)!.addEventListener('change', e => {
      const chosen = (e.target as HTMLSelectElement).value as GameSettings['resolutionPreset'];
      if (!window.confirm('Изменение размера очистит текущий мир. Продолжить?')) {
        (e.target as HTMLSelectElement).value = this.settings.resolutionPreset; return;
      }
      this.settings.resolutionPreset = chosen;
      for (const selector of ['selResolution','selWorldSize']) (this.root.querySelector('#' + selector) as HTMLSelectElement).value = chosen;
      if (this.engine.applySettings(this.settings)) { this.fitCanvasViewport(); DEMO_SCENES[0].build(this.engine.world); }
    });

    this.root.querySelector('#rngSubsteps')!.addEventListener('input', (e) => {
      this.settings.substeps = Number((e.target as HTMLInputElement).value);
      this.root.querySelector('#valSubsteps')!.textContent = String(this.settings.substeps);
    });

    this.root.querySelector('#chkTextures')!.addEventListener('change', (e) => {
      this.settings.realisticTextures = (e.target as HTMLInputElement).checked;
    });
    this.root.querySelector('#chkBloom')!.addEventListener('change', (e) => {
      this.settings.hdrBloom = (e.target as HTMLInputElement).checked;
    });
    this.root.querySelector('#chkSpec')!.addEventListener('change', (e) => {
      this.settings.refractionAndSpec = (e.target as HTMLInputElement).checked;
    });
    this.root.querySelector('#chkShimmer')!.addEventListener('change', (e) => {
      this.settings.heatShimmer = (e.target as HTMLInputElement).checked;
    });
    this.root.querySelector('#chkVectors')!.addEventListener('change', (e) => {
      this.settings.airVectorsOverlay = (e.target as HTMLInputElement).checked;
    });
    this.root.querySelector('#chkSound')!.addEventListener('change', (e) => {
      this.settings.soundEnabled = (e.target as HTMLInputElement).checked;
    });

    // Exit / Save / Export Modal
    this.root.querySelector('#btnExit')!.addEventListener('click', () => {
      this.exitModalEl.classList.remove('hidden');
    });
    this.root.querySelector('#btnCloseExit')!.addEventListener('click', () => {
      this.exitModalEl.classList.add('hidden');
    });
    this.exitModalEl.addEventListener('click', (e) => {
      if (e.target === this.exitModalEl) this.exitModalEl.classList.add('hidden');
    });

    this.root.querySelector('#btnSavePng')!.addEventListener('click', () => {
      const a = document.createElement('a');
      a.download = `pixphyso-${Date.now()}.png`;
      const composite=document.createElement('canvas'); composite.width=this.simCanvas.width; composite.height=this.simCanvas.height;
      const ctx=composite.getContext('2d');
      if (ctx) { ctx.drawImage(this.simCanvas,0,0); ctx.drawImage(this.hudCanvas,0,0,composite.width,composite.height); }
      a.href = (ctx ? composite : this.simCanvas).toDataURL('image/png');
      a.click();
    });

    this.root.querySelector('#btnExportSave')!.addEventListener('click', () => {
      const w = this.engine.world;
      const payload = {
        version: 3,
        width: w.width,
        height: w.height,
        env: w.env,
        mat: Array.from(w.mat),
        temp: Array.from(w.temp),
        meta: Array.from(w.meta),
        vx: Array.from(w.vx), vy: Array.from(w.vy), wetness: Array.from(w.wetness), absorbedMat: Array.from(w.absorbedMat),
        volt: Array.from(w.volt), current: Array.from(w.current), stress: Array.from(w.stress), seed: Array.from(w.seed),
        airPressure: Array.from(w.airPressure), airVx: Array.from(w.airVx), airVy: Array.from(w.airVy), airOxygen: Array.from(w.airOxygen), waveHeight: Array.from(w.waveHeight), waveVelocity: Array.from(w.waveVelocity),
        sensors: w.sensors, wires: w.wires, wheels: w.wheels, mechanicalSprings: w.mechanicalSprings, timeSec: w.timeSec, stepTick: w.stepTick,
      };
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const a = document.createElement('a');
      a.download = `pixphyso-world-${Date.now()}.pixphyso.json`;
      a.href = URL.createObjectURL(blob);
      a.click();
    });

    this.root.querySelector('#inpImportSave')!.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const txt = await file.text();
        const parsed = JSON.parse(txt);
        if (!Number.isInteger(parsed.width) || !Number.isInteger(parsed.height) || parsed.width < 1 || parsed.height < 1 || parsed.width > 2000 || parsed.height > 2000 || !Array.isArray(parsed.mat) || parsed.mat.length !== parsed.width*parsed.height || parsed.mat.some((m: unknown) => !Number.isInteger(m) || (m as number) < 0 || (m as number) >= MATERIAL_BY_ID.length)) throw new Error('Повреждённый файл мира');
        const fields=['mat','temp','meta','vx','vy','wetness','absorbedMat','volt','current','stress','seed','airPressure','airVx','airVy','airOxygen','waveHeight','waveVelocity'] as const;
        const n=parsed.width*parsed.height, airSize=Math.ceil(parsed.width/4)*Math.ceil(parsed.height/4);
        for (const field of fields) if (parsed[field] !== undefined) {
          const values=parsed[field] as unknown;
          const expected=field.startsWith('air') ? airSize : field.startsWith('wave') ? parsed.width : n;
          if (!Array.isArray(values) || values.length !== expected || values.some(v => typeof v !== 'number' || !Number.isFinite(v))) throw new Error('Повреждённые данные поля');
        }
        // Validate before touching the running world so a damaged file cannot erase it.
        const world=this.engine.world; world.resize(parsed.width,parsed.height); world.clear(); world.resetUndoHistory();
        for (const field of fields) if (Array.isArray(parsed[field])) world[field].set(parsed[field]);
        if (parsed.env && typeof parsed.env === 'object') Object.assign(world.env, parsed.env);
        const valid = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
        if (Array.isArray(parsed.sensors)) world.sensors=parsed.sensors.filter((p: any) => p && Number.isInteger(p.x) && Number.isInteger(p.y) && world.inBounds(p.x,p.y)).slice(0,16);
        if (Array.isArray(parsed.wheels)) world.wheels=parsed.wheels.filter((p: any) => p && ['gear','motor','turbine','crusher'].includes(p.kind) && Number.isInteger(p.x) && Number.isInteger(p.y) && Number.isInteger(p.radius) && p.radius>=4 && p.radius<=32 && valid(p.angle) && valid(p.omega) && world.inBounds(p.x,p.y)).slice(0,64);
        if (Array.isArray(parsed.mechanicalSprings)) world.mechanicalSprings=parsed.mechanicalSprings.filter((p: any) => p && ['ax','ay','x','y','vx','vy','restLength','stiffness','damping'].every(k => valid(p[k])) && world.inBounds(p.ax,p.ay) && world.inBounds(p.x,p.y)).slice(0,64);
        if (Array.isArray(parsed.wires)) world.wires=parsed.wires.filter((p: any) => p && ['ax','ay','bx','by'].every(k => Number.isInteger(p[k])) && valid(p.tension) && p.tension>=0 && p.tension<=1 && world.inBounds(p.ax,p.ay) && world.inBounds(p.bx,p.by) && Array.isArray(p.points) && p.points.length>=3 && p.points.length<=256 && p.points.every((q: any) => q && ['x','y','oldX','oldY'].every(k => valid(q[k])))).slice(0,128);
        if (valid(parsed.timeSec)) world.timeSec=parsed.timeSec;
        if (Number.isInteger(parsed.stepTick)) world.stepTick=parsed.stepTick & 0xffff;
        this.fitCanvasViewport(); this.syncEnvironmentUI(); this.exitModalEl.classList.add('hidden');
      } catch (err) {
        console.error('Import failed:', err);
        window.alert('Не удалось загрузить файл мира: ' + String(err));
      } finally { (e.target as HTMLInputElement).value = ''; }
    });

    this.root.querySelector('#btnResetLab')!.addEventListener('click', () => {
      DEMO_SCENES[0].build(this.engine.world);
      this.exitModalEl.classList.add('hidden');
    });
  }

  private eventToSimCoords(e: PointerEvent | WheelEvent): [number, number] {
    const rect = this.simCanvas.getBoundingClientRect();
    const u = (e.clientX - rect.left) / Math.max(1, rect.width);
    const v = (e.clientY - rect.top) / Math.max(1, rect.height);
    const sx = Math.max(0, Math.min(this.engine.world.width - 1, Math.floor(u * this.engine.world.width)));
    const sy = Math.max(0, Math.min(this.engine.world.height - 1, Math.floor(v * this.engine.world.height)));
    return [sx, sy];
  }

  private applyCamera(): void {
    this.canvasFrame.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  private bindCanvasInput(): void {
    this.root.querySelector('#btnEnv')!.addEventListener('click', () => { this.root.querySelector('.env-sidebar')!.classList.toggle('mobile-open'); });
    this.root.querySelector('#btnCloseEnv')!.addEventListener('click', () => { this.root.querySelector('.env-sidebar')!.classList.remove('mobile-open'); });
    this.canvasFrame.addEventListener('contextmenu', (e) => e.preventDefault());

    this.canvasFrame.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1 : -1;
        this.brushRadius = Math.max(0, Math.min(32, this.brushRadius + delta));
        (this.root.querySelector('#rngBrush') as HTMLInputElement).value = String(this.brushRadius);
        this.root.querySelector('#valBrush')!.textContent = String(this.brushRadius);
      },
      { passive: false }
    );

    const startPointer = (e: PointerEvent) => {
      const [sx, sy] = this.eventToSimCoords(e);
      this.pointerSimX = sx;
      this.pointerSimY = sy;
      this.prevSimX = sx;
      this.prevSimY = sy;
      this.pointerDown = true;
      this.pointerErase = e.button === 2;
      this.pointerInteractedSwitch = false;
      if (e.pointerType !== 'touch') this.canvasFrame.setPointerCapture(e.pointerId);

      if (this.mechanicalMode && !this.pointerErase) {
        this.pointerInteractedSwitch = true;
        const world = this.engine.world;
        if (this.mechanicalMode === 'spring') {
          if (!this.springStart) this.springStart = [sx,sy];
          else { const [ax,ay] = this.springStart; if (Math.hypot(sx-ax,sy-ay)>=4 && world.mechanicalSprings.length<64) { world.pushUndo(); world.mechanicalSprings.push(makeSpring(ax,ay,sx,sy)); } this.springStart=null; }
        } else if (this.mechanicalMode === 'remove') {
          let best=-1, dist=Infinity;
          for (let n=0;n<world.wheels.length;n++) { const wheel=world.wheels[n], d=Math.hypot(sx-wheel.x,sy-wheel.y); if (d<=wheel.radius && d<dist) { best=n; dist=d; } }
          if (best>=0) { world.pushUndo(); world.wheels.splice(best,1); }
          else { const n=world.mechanicalSprings.findIndex(s => Math.min(Math.hypot(sx-s.ax,sy-s.ay),Math.hypot(sx-s.x,sy-s.y))<6); if (n>=0) { world.pushUndo(); world.mechanicalSprings.splice(n,1); } }
        } else if (world.wheels.length < 64) {
          const radius=Math.max(4,Math.min(32,this.brushRadius*2+4)); let x=sx, y=sy;
          // Snap nearby circles onto a tooth contact so precise pixel clicks are unnecessary.
          if (this.mechanicalMode !== 'motor') for (const other of world.wheels) {
            const dx=x-other.x, dy=y-other.y, distance=Math.hypot(dx,dy), desired=radius+other.radius;
            if (distance>0 && Math.abs(distance-desired)<=5) { x=Math.round(other.x+dx/distance*desired); y=Math.round(other.y+dy/distance*desired); break; }
          }
          if (world.inBounds(x,y) && !world.wheels.some(other => Math.hypot(x-other.x,y-other.y)<radius+other.radius-1.5)) {
            world.pushUndo(); world.wheels.push(makeWheel(this.mechanicalMode,x,y,radius));
          }
        }
        return;
      }
      if (this.placingTemplate && !this.pointerErase) {
        placeTemplate(this.engine.world, this.placingTemplate, sx, sy); this.placingTemplate = null;
        (this.root.querySelector('#btnWorlds') as HTMLElement).textContent = 'Миры'; this.pointerInteractedSwitch = true; return;
      }
      if (this.wireMode && !this.pointerErase) {
        this.pointerInteractedSwitch = true;
        if (ELEC_COND_LUT[this.engine.world.mat[sy * this.engine.world.width + sx]] <= 0) { this.probeEl.textContent = 'Точка кабеля должна быть на проводнике.'; return; }
        if (!this.wireStart) { this.wireStart = [sx, sy]; this.probeEl.textContent = 'Выберите вторую точку кабеля.'; }
        else { const [ax, ay] = this.wireStart; if (ax !== sx || ay !== sy) { this.engine.world.pushUndo(); this.engine.world.wires.push(makeWire(ax, ay, sx, sy, this.wireTension)); } this.wireStart = null; }
        return;
      }
      if (!this.pointerErase && this.editMode !== 'paint') {
        const world = this.engine.world;
        if (this.editMode === 'pick') {
          const id = world.mat[sy * world.width + sx];
          if (SELECTABLE_MATERIALS.some(m => m.id === id)) this.selectMaterial(id);
          this.pointerInteractedSwitch = true; return;
        }
        if (this.editMode === 'ruler') {
          if (!this.measureStart) this.measureStart = [sx, sy];
          else {
            const [x,y] = this.measureStart, length = Math.hypot(sx-x, sy-y).toFixed(1);
            (this.root.querySelector('[data-edit="ruler"]') as HTMLElement).textContent = `Линейка: ${length} кл.`;
            this.measureStart = null;
          }
          this.pointerInteractedSwitch = true; return;
        }
        if (this.editMode === 'fill') {
          this.pointerInteractedSwitch = true;
          if (MATERIAL_BY_ID[this.selectedMatId].state === 'tool') return;
          const target = world.mat[sy * world.width + sx];
          if (target === this.selectedMatId) return;
          world.pushUndo();
          const queue = new Int32Array(world.size), seen = new Uint8Array(world.size);
          let head = 0, tail = 0, start = sy * world.width + sx; queue[tail++] = start; seen[start] = 1;
          while (head < tail) {
            const i = queue[head++], x = i % world.width, y = (i / world.width) | 0;
            world.setCell(x, y, this.selectedMatId);
            const add = (j: number) => { if (!seen[j] && world.mat[j] === target) { seen[j] = 1; queue[tail++] = j; } };
            if (x > 0) add(i-1); if (x+1 < world.width) add(i+1); if (y > 0) add(i-world.width); if (y+1 < world.height) add(i+world.width);
          }
          return;
        }
        this.lineStartX = sx; this.lineStartY = sy; if (this.editMode !== 'template') world.pushUndo(); return;
      }
      if (!this.pointerErase && this.selectedMatId === MAT.TOOL_SENSOR) {
        const pins = this.engine.world.sensors;
        const existing = pins.findIndex(p => Math.hypot(p.x - sx, p.y - sy) < 4);
        if (existing >= 0) pins.splice(existing, 1);
        else if (pins.length < 16) pins.push({ id: Date.now(), x: sx, y: sy });
        this.pointerInteractedSwitch = true;
        return;
      }
      // Direct click on Switch or Button on canvas flips/presses it!
      if (
        !this.pointerErase &&
        this.selectedMatId !== MAT.TOOL_ERASER &&
        this.selectedMatId !== MAT.SWITCH &&
        this.selectedMatId !== MAT.BUTTON &&
        this.selectedMatId !== MAT.GAS_CYLINDER &&
        !this.replaceMode
      ) {
        if (this.engine.world.interactClickAt(sx, sy)) {
          this.pointerInteractedSwitch = true;
          return;
        }
      }

      if (!this.pointerErase && this.selectedMatId === MAT.TOOL_HAND) {
        this.engine.startHandGrab(sx, sy, this.brushRadius);
        return;
      }

      this.engine.world.pushUndo();

      if (!this.pointerErase && (this.brushShape === 'line' || this.shiftHeld)) {
        this.lineStartX = sx;
        this.lineStartY = sy;
        return;
      }

      this.engine.applyBrushStroke(
        sx,
        sy,
        sx,
        sy,
        this.selectedMatId,
        this.brushRadius,
        this.brushShape,
        this.replaceMode,
        this.pointerErase
      );
    };

    const movePointer = (e: PointerEvent) => {
      const [sx, sy] = this.eventToSimCoords(e);
      this.pointerSimX = sx;
      this.pointerSimY = sy;

      if (!this.pointerDown || this.pointerInteractedSwitch) return;
      if (this.editMode === 'rectangle' || this.editMode === 'ellipse' || this.editMode === 'template') return;

      if (!this.pointerErase && this.selectedMatId === MAT.TOOL_HAND) {
        this.engine.moveHandGrab(sx, sy);
        return;
      }

      if (!this.pointerErase && (this.brushShape === 'line' || this.shiftHeld) && this.lineStartX >= 0) {
        return; // Previewed on HUD canvas, committed on pointerup
      }

      this.engine.applyBrushStroke(
        this.prevSimX,
        this.prevSimY,
        sx,
        sy,
        this.selectedMatId,
        this.brushRadius,
        this.brushShape,
        this.replaceMode,
        this.pointerErase
      );
      this.prevSimX = sx;
      this.prevSimY = sy;
    };

    const finishPointer = () => {
      if (!this.pointerDown) return;
      if (!this.pointerErase && !this.pointerInteractedSwitch && this.editMode === 'template' && this.lineStartX >= 0) {
        this.templateRegion = [[this.lineStartX,this.lineStartY], [this.pointerSimX,this.pointerSimY]];
        (this.root.querySelector('#btnWorlds') as HTMLElement).click();
        (this.root.querySelector('#worldMessage') as HTMLElement).textContent = 'Область выделена — введите имя и нажмите «Схему».';
      }
      if (!this.pointerErase && !this.pointerInteractedSwitch && (this.editMode === 'rectangle' || this.editMode === 'ellipse') && this.lineStartX >= 0 && MATERIAL_BY_ID[this.selectedMatId].state !== 'tool') {
        const world = this.engine.world, x0 = Math.min(this.lineStartX, this.pointerSimX), x1 = Math.max(this.lineStartX, this.pointerSimX), y0 = Math.min(this.lineStartY, this.pointerSimY), y1 = Math.max(this.lineStartY, this.pointerSimY);
        const cx = (x0+x1)/2, cy = (y0+y1)/2, rx = Math.max(.5,(x1-x0+1)/2), ry = Math.max(.5,(y1-y0+1)/2);
        for (let y=y0; y<=y1; y++) for (let x=x0; x<=x1; x++) {
          if (this.editMode === 'ellipse' && ((x-cx)/rx)**2 + ((y-cy)/ry)**2 > 1) continue;
          if (this.replaceMode || world.mat[y*world.width+x] === MAT.EMPTY) world.setCell(x,y,this.selectedMatId);
        }
      }
      if (
        !this.pointerErase &&
        !this.pointerInteractedSwitch &&
        this.editMode === 'paint' &&
        (this.brushShape === 'line' || this.shiftHeld) &&
        this.lineStartX >= 0
      ) {
        this.engine.applyBrushStroke(
          this.lineStartX,
          this.lineStartY,
          this.pointerSimX,
          this.pointerSimY,
          this.selectedMatId,
          this.brushRadius,
          'circle',
          this.replaceMode,
          false
        );
      }
      if (this.engine.world.hand.active) {
        this.engine.world.releaseHand(false);
      }
      this.pointerDown = false;
      this.pointerInteractedSwitch = false;
      this.lineStartX = -1;
      this.lineStartY = -1;
    };

    // Single-touch strokes are committed on release. This prevents the first
    // finger of a pinch/pan from leaving an accidental mark before the second arrives.
    const touches = new Map<number, {x: number; y: number}>();
    let pending: PointerEvent[] = [], gesturing = false;
    let gestureStart = {distance: 1, x: 0, y: 0, zoom: 1, panX: 0, panY: 0};
    const pair = () => Array.from(touches.values()).slice(0, 2);
    this.canvasFrame.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'touch') { startPointer(e); return; }
      this.canvasFrame.setPointerCapture(e.pointerId);
      touches.set(e.pointerId, {x: e.clientX, y: e.clientY});
      if (touches.size === 1 && !gesturing) pending = [e];
      if (touches.size === 2) {
        pending = []; gesturing = true;
        const [a,b] = pair();
        gestureStart = {distance: Math.max(1, Math.hypot(b.x-a.x,b.y-a.y)), x:(a.x+b.x)/2, y:(a.y+b.y)/2, zoom:this.zoom, panX:this.panX, panY:this.panY};
      }
    });
    this.canvasFrame.addEventListener('pointermove', e => {
      if (e.pointerType !== 'touch') { movePointer(e); return; }
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, {x:e.clientX, y:e.clientY});
      if (gesturing && touches.size >= 2) {
        const [a,b] = pair();
        this.zoom = Math.max(1, Math.min(5, gestureStart.zoom * Math.hypot(b.x-a.x,b.y-a.y)/gestureStart.distance));
        const maxX = this.canvasFrame.offsetWidth * this.zoom * .45, maxY = this.canvasFrame.offsetHeight * this.zoom * .45;
        this.panX = Math.max(-maxX, Math.min(maxX, gestureStart.panX + (a.x+b.x)/2 - gestureStart.x));
        this.panY = Math.max(-maxY, Math.min(maxY, gestureStart.panY + (a.y+b.y)/2 - gestureStart.y));
        this.applyCamera();
      } else if (!gesturing && pending.length < 512) pending.push(e);
    });
    const endTouch = (e: PointerEvent, cancelled: boolean) => {
      if (e.pointerType !== 'touch') { finishPointer(); return; }
      if (!touches.has(e.pointerId)) return;
      touches.delete(e.pointerId);
      if (!gesturing && !cancelled && pending.length) {
        startPointer(pending[0]);
        for (let n = 1; n < pending.length; n++) movePointer(pending[n]);
        movePointer(e); finishPointer();
      }
      pending = [];
      if (touches.size === 0) gesturing = false;
    };
    this.canvasFrame.addEventListener('pointerup', e => endTouch(e, false));
    this.canvasFrame.addEventListener('pointercancel', e => endTouch(e, true));
    this.canvasFrame.addEventListener('pointerleave', () => {
      if (!this.pointerDown) {
        this.pointerSimX = -1;
        this.pointerSimY = -1;
      }
    });
  }

  private bindKeyboard(): void {
    // Раньше проверялся только тег INPUT: после любого ползунка или чекбокса
    // фокус оставался на нём и пробел/F/Ctrl+Z переставали работать, зато
    // пробел в выпадающем списке одновременно открывал список и ставил паузу.
    const isTextEntry = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable) return true;
      if (tag !== 'INPUT') return false;
      const type = (el as HTMLInputElement).type;
      return type === 'text' || type === 'search' || type === 'number' || type === 'password' ||
        type === 'email' || type === 'url' || type === 'tel';
    };
    const modalOpen = (): boolean => !!this.root.querySelector('.modal-backdrop:not(.hidden)');

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Shift') { this.shiftHeld = true; return; }
      if (e.repeat) return; // удержание пробела больше не дёргает паузу, Ctrl+Z не съедает всю историю

      // Глобальная комбинация с модификатором — только отмена действия.
      if (e.ctrlKey || e.metaKey || e.altKey) {
        if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'z' && !isTextEntry(document.activeElement)) {
          e.preventDefault();
          this.engine.world.popUndo();
        }
        return;
      }
      if (isTextEntry(document.activeElement) || modalOpen()) return;

      const key = e.key.toLowerCase();
      if (e.code === 'Space') {
        e.preventDefault();
        (this.root.querySelector('#btnPlayPause') as HTMLButtonElement).click();
      } else if (key === 'f') {
        (this.root.querySelector('#btnStep') as HTMLButtonElement).click();
      } else if (key === 'n') {
        this.toggleNewOnly();
      } else if (key === 'q') {
        this.cycleDisplayMode(-1);
      } else if (key === 'e') {
        this.cycleDisplayMode(1);
      } else if (key === 'r' && [
        MAT.FAN, MAT.PUMP, MAT.VALVE, MAT.DIODE, MAT.RELAY, MAT.COMPRESSOR, MAT.VACUUM_PUMP,
        XMAT.PIEZO, XMAT.THERMOCOUPLE,
      ].some(id => id === this.selectedMatId)) {
        this.engine.world.activeFanDir = ((this.engine.world.activeFanDir + 1) & 3) as FanDirection;
        this.root.querySelectorAll<HTMLButtonElement>('#fanDirBar [data-fandir]').forEach((b) => {
          b.classList.toggle('active', Number(b.dataset.fandir) === this.engine.world.activeFanDir);
        });
      } else if (e.key >= '0' && e.key <= '7' && e.key.length === 1) {
        // 0 — все предметы, 1..7 — быстрый переход к категории каталога.
        const cat = CATEGORIES[Number(e.key)];
        if (cat) {
          this.selectedCategory = cat.id;
          this.renderCategories();
          this.renderItemsStrip();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') this.shiftHeld = false;
    });
    // После Alt+Tab залипший Shift больше не превращает каждую линию в «прямую».
    window.addEventListener('blur', () => { this.shiftHeld = false; });
  }

  private drawHudOverlay(): void {
    const ctx = this.hudCtx;
    const cw = this.hudCanvas.width / this.hudScale;
    const ch = this.hudCanvas.height / this.hudScale;
    ctx.setTransform(this.hudScale, 0, 0, this.hudScale, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    const world = this.engine.world;
    const scaleX = cw / world.width;
    const scaleY = ch / world.height;

    // Thin highlights follow the simulated wind-driven surface displacement.
    const surface=this.engine.surfaceWaveSolver.getSurfaceY();
    if (surface.length===world.width) {
      ctx.strokeStyle='rgba(220,235,240,.55)'; ctx.lineWidth=1; ctx.beginPath(); let drawing=false;
      for (let x=0;x<world.width;x++) {
        const y=surface[x];
        if (y<0 || Math.abs(world.waveHeight[x])<.03) { drawing=false; continue; }
        const px=(x+.5)*scaleX, py=(y+.5-world.waveHeight[x])*scaleY;
        if (!drawing) ctx.moveTo(px,py); else ctx.lineTo(px,py); drawing=true;
      }
      ctx.stroke();
    }

    // Pinned, dynamically coupled mechanical wheels and anchored springs.
    for (const wheel of world.wheels) {
      const teeth=Math.max(8,Math.round(wheel.radius*1.2));
      ctx.beginPath();
      for (let i=0;i<teeth*4;i++) {
        const angle=wheel.angle+i*Math.PI*2/(teeth*4), r=wheel.radius+(i%4===1||i%4===2 ? .8 : -.8);
        const x=(wheel.x+.5+Math.cos(angle)*r)*scaleX, y=(wheel.y+.5+Math.sin(angle)*r)*scaleY;
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.fillStyle='rgba(45,45,45,.88)'; ctx.fill(); ctx.strokeStyle='#ddd'; ctx.lineWidth=1.2; ctx.stroke();
      ctx.beginPath();
      for (let n=0;n<4;n++) { const a=wheel.angle+n*Math.PI/2; ctx.moveTo((wheel.x+.5)*scaleX,(wheel.y+.5)*scaleY); ctx.lineTo((wheel.x+.5+Math.cos(a)*wheel.radius*.72)*scaleX,(wheel.y+.5+Math.sin(a)*wheel.radius*.72)*scaleY); }
      ctx.strokeStyle='#aaa'; ctx.stroke();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc((wheel.x+.5)*scaleX,(wheel.y+.5)*scaleY,Math.max(2,2*scaleX),0,Math.PI*2); ctx.fill();
      if (wheel.kind!=='gear') { ctx.font='bold 10px Roboto Mono'; ctx.textAlign='center'; ctx.fillText(wheel.kind==='motor'?'M':wheel.kind==='turbine'?'T':'Д',(wheel.x+.5)*scaleX,(wheel.y+.5)*scaleY-4); }
    }
    for (const spring of world.mechanicalSprings) {
      const dx=spring.x-spring.ax, dy=spring.y-spring.ay, length=Math.max(1,Math.hypot(dx,dy)), nx=-dy/length, ny=dx/length;
      ctx.beginPath(); ctx.moveTo((spring.ax+.5)*scaleX,(spring.ay+.5)*scaleY);
      for(let i=1;i<16;i++) { const t=i/16, bend=(i%2?1:-1)*2.2; ctx.lineTo((spring.ax+dx*t+nx*bend+.5)*scaleX,(spring.ay+dy*t+ny*bend+.5)*scaleY); }
      ctx.lineTo((spring.x+.5)*scaleX,(spring.y+.5)*scaleY); ctx.strokeStyle='#ddd'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc((spring.x+.5)*scaleX,(spring.y+.5)*scaleY,Math.max(2,3*scaleX),0,Math.PI*2); ctx.fillStyle='#ddd'; ctx.fill();
    }
    if (this.springStart) { ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc((this.springStart[0]+.5)*scaleX,(this.springStart[1]+.5)*scaleY,4,0,Math.PI*2); ctx.fill(); }

    // Hanging wires are simulated as constrained flexible segments.
    for (const wire of world.wires) {
      ctx.beginPath(); ctx.strokeStyle = '#181818'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      wire.points.forEach((p, i) => i ? ctx.lineTo((p.x + .5) * scaleX, (p.y + .5) * scaleY) : ctx.moveTo((p.x + .5) * scaleX, (p.y + .5) * scaleY));
      ctx.stroke(); ctx.strokeStyle = '#d8d8d8'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    if (this.wireStart) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc((this.wireStart[0]+.5)*scaleX, (this.wireStart[1]+.5)*scaleY, 4, 0, Math.PI*2); ctx.fill(); }

    // 1. Optional Airflow Velocity Vectors Overlay
    if (this.settings.airVectorsOverlay) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.3;
      for (let ay = 1; ay < world.airH; ay += 2) {
        for (let ax = 1; ax < world.airW; ax += 2) {
          const ai = ay * world.airW + ax;
          const vx = world.airVx[ai];
          const vy = world.airVy[ai];
          if (Math.abs(vx) + Math.abs(vy) < 0.8) continue;
          const sx = (ax * world.airScale + 2) * scaleX;
          const sy = (ay * world.airScale + 2) * scaleY;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + vx * 1.4, sy + vy * 1.4);
          ctx.stroke();
        }
      }
    }

    // 2. Hand Tool Active Grab & Fracture Stress Visualization
    const hand = world.hand;
    if (hand.active) {
      if (!hand.detached) {
        const ax = (hand.anchorX + 0.5) * scaleX;
        const ay = (hand.anchorY + 0.5) * scaleY;
        const tx = (hand.targetX + 0.5) * scaleX;
        const ty = (hand.targetY + 0.5) * scaleY;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Roboto Mono';
        ctx.fillText(`Усилие отрыва: ${Math.round(hand.pullForce)} кПа`, tx + 12, ty - 8);
      } else {
        // Draw torn pixel cluster attached to cursor!
        const cx = Math.round(hand.targetX);
        const cy = Math.round(hand.targetY);
        for (const p of hand.cluster) {
          const def = MATERIAL_BY_ID[p.mat];
          ctx.fillStyle = `rgb(${def.baseColor[0]}, ${def.baseColor[1]}, ${def.baseColor[2]})`;
          ctx.fillRect((cx + p.dx) * scaleX, (cy + p.dy) * scaleY, Math.ceil(scaleX), Math.ceil(scaleY));
        }
      }
    }

    if (this.pointerDown && this.lineStartX >= 0 && ['rectangle','ellipse','template'].includes(this.editMode)) {
      const x = (Math.min(this.lineStartX,this.pointerSimX)+.5)*scaleX, y=(Math.min(this.lineStartY,this.pointerSimY)+.5)*scaleY;
      const w = (Math.abs(this.pointerSimX-this.lineStartX)+1)*scaleX, h=(Math.abs(this.pointerSimY-this.lineStartY)+1)*scaleY;
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.setLineDash([4,3]); ctx.beginPath();
      if (this.editMode === 'ellipse') ctx.ellipse(x+w/2,y+h/2,Math.max(.5,w/2),Math.max(.5,h/2),0,0,Math.PI*2); else ctx.rect(x,y,w,h);
      ctx.stroke(); ctx.setLineDash([]);
    }

    // 3. Straight Line Tool Preview
    if (this.pointerDown && (this.brushShape === 'line' || this.shiftHeld) && this.lineStartX >= 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = Math.max(2, (this.brushRadius * 2 + 1) * scaleX);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo((this.lineStartX + 0.5) * scaleX, (this.lineStartY + 0.5) * scaleY);
      ctx.lineTo((this.pointerSimX + 0.5) * scaleX, (this.pointerSimY + 0.5) * scaleY);
      ctx.stroke();
    }

    // Controller readouts sample exactly the pinned cell. Prefer empty nearby areas,
    // penalising overlaps with other callouts and keeping rectangles inside the viewport.
    const boxes: {x: number; y: number; w: number; h: number}[] = [];
    for (const pin of world.sensors) {
      const bw = Math.min(205, cw * 0.7), bh = 105;
      const px = (pin.x + 0.5) * scaleX, py = (pin.y + 0.5) * scaleY;
      let best = { x: 0, y: 0, w: bw, h: bh }, bestScore = -Infinity;
      for (const distance of [24, 65, 115]) for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        const x = Math.max(2, Math.min(cw - bw - 2, px + Math.cos(a) * (distance + bw / 2) - bw / 2));
        const y = Math.max(2, Math.min(ch - bh - 2, py + Math.sin(a) * (distance + bh / 2) - bh / 2));
        let empty = 0;
        for (let sy = 0; sy < 6; sy++) for (let sx = 0; sx < 10; sx++) {
          const wx = Math.min(world.width - 1, Math.max(0, Math.floor((x + (sx + .5) * bw / 10) / scaleX)));
          const wy = Math.min(world.height - 1, Math.max(0, Math.floor((y + (sy + .5) * bh / 6) / scaleY)));
          if (world.mat[wy * world.width + wx] === MAT.EMPTY) empty++;
        }
        const overlaps = boxes.filter(b => x < b.x + b.w && x + bw > b.x && y < b.y + b.h && y + bh > b.y).length;
        const coversPoint = px >= x && px <= x + bw && py >= y && py <= y + bh;
        const score = empty - overlaps * 100 - (coversPoint ? 80 : 0) - distance * .01;
        if (score > bestScore) { bestScore = score; best = { x, y, w: bw, h: bh }; }
      }
      boxes.push(best);
      const pr = world.probeAt(pin.x, pin.y);
      const tx = Math.max(best.x, Math.min(best.x + bw, px)), ty = Math.max(best.y, Math.min(best.y + bh, py));
      ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(px, py); ctx.stroke();
      const angle = Math.atan2(py - ty, px - tx);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 7 * Math.cos(angle - .45), py - 7 * Math.sin(angle - .45));
      ctx.moveTo(px, py); ctx.lineTo(px - 7 * Math.cos(angle + .45), py - 7 * Math.sin(angle + .45)); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.fillRect(best.x, best.y, bw, bh); ctx.strokeRect(best.x, best.y, bw, bh);
      ctx.fillStyle = '#fff'; ctx.font = '11px Roboto Mono, monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const rows = [`[${pin.x}, ${pin.y}] ${pr.matName}`, `T: ${pr.tempC.toFixed(1)} °C`, `P: ${pr.pressureKPa.toFixed(1)} кПа`, `U: ${pr.voltage.toFixed(1)} В`, `O₂: ${(pr.oxygenFraction*100).toFixed(1)} %`, `ρ: ${pr.density} кг/м³`];
      rows.forEach((row, i) => ctx.fillText(row, best.x + 5, best.y + 15 + i * 15, bw - 10));
    }

    // 4. Cursor Brush Reticle & Interactive Switch/Button Hint
    if (this.pointerSimX >= 0 && this.pointerSimY >= 0) {
      const px = (this.pointerSimX + 0.5) * scaleX;
      const py = (this.pointerSimY + 0.5) * scaleY;
      const rPx = Math.max(2, (this.brushRadius + 0.5) * scaleX);

      ctx.strokeStyle = this.pointerErase ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.78)';
      ctx.lineWidth = 1.4;
      if (this.brushShape === 'square') {
        ctx.strokeRect(px - rPx, py - rPx, rPx * 2, rPx * 2);
      } else {
        ctx.beginPath();
        ctx.arc(px, py, rPx, 0, Math.PI * 2);
        ctx.stroke();
      }

      const hoveredMat = world.mat[this.pointerSimY * world.width + this.pointerSimX];
      if (hoveredMat === MAT.SWITCH || hoveredMat === MAT.BUTTON) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
        ctx.fillRect(px + 12, py - 24, 154, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 11px Roboto Mono';
        ctx.fillText(hoveredMat === MAT.SWITCH ? '⚡ Клик: переключить' : '⚡ Клик: нажать кнопку', px + 17, py - 10);
      }
    }
  }

  private updateStatusHud(): void {
    const modeTag = this.settings.computeMode === 'gpu90' ? 'Приоритет GPU' : 'Баланс';
    this.computeBadgeEl.textContent = `${modeTag} · GPU рендер / CPU физика`;
    this.telemetryEl.textContent = `${this.fps} FPS · ${this.particleCount.toLocaleString('ru-RU')} частиц · CPU физика · GPU рендер`;
    const clock = this.root.querySelector('#modeClock');
    if (clock) {
      clock.textContent = `t = ${this.engine.world.timeSec.toFixed(2).replace('.', ',')} с · ${this.engine.speedMultiplier}×${this.engine.paused ? ' · пауза' : ''}`;
    }

    if (this.pointerSimX >= 0 && this.pointerSimY >= 0) {
      const pr = this.engine.world.probeAt(this.pointerSimX, this.pointerSimY);
      const tempK = Math.max(0, pr.tempC + 273.15);
      const windMag = Math.hypot(pr.windVx, pr.windVy);
      this.probeEl.textContent = `[${pr.x}, ${pr.y}] ${pr.matName} · T: ${pr.tempC.toFixed(1)} °C (${Math.round(tempK)} K) · P: ${pr.pressureKPa.toFixed(1)} кПа · Ветер: ${windMag.toFixed(1)} м/с · O₂: ${(pr.oxygenFraction*100).toFixed(1)} % · U: ${pr.voltage.toFixed(1)} В · ρ: ${pr.density} кг/м³`;
    }
  }

  private startLoop(): void {
    let lastFrameAt = performance.now();
    const tick = () => {
      const now = performance.now();
      // Реальное время между кадрами: 1× означает «секунда в секунду»
      // и не зависит от частоты монитора или просадок FPS.
      const realDt = (now - lastFrameAt) / 1000;
      lastFrameAt = now;
      const cpuMs = this.engine.stepFrame(this.settings, false, realDt);
      const { gpuMs, particleCount } = this.gpu.render(this.engine.world, this.settings, this.displayMode);
      this.sound.tick(this.engine.world, this.settings);
      this.drawHudOverlay();

      this.smoothCpuMs = this.smoothCpuMs * 0.9 + cpuMs * 0.1;
      this.smoothGpuMs = this.smoothGpuMs * 0.9 + gpuMs * 0.1;
      this.particleCount = particleCount;

      this.frameCounter++;
      if (now - this.lastFpsStamp >= 500) {
        this.fps = Math.min(144, Math.round((this.frameCounter * 1000) / (now - this.lastFpsStamp)));
        this.frameCounter = 0;
        this.lastFpsStamp = now;
        this.updateStatusHud();
      } else if (this.pointerSimX >= 0 && (this.frameCounter & 3) === 0) {
        this.updateStatusHud();
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
