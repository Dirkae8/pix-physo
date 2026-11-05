export class WindCompass {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dragging = false;

  constructor(
    container: HTMLElement,
    private angleDeg: number,
    private speed: number,
    private onChange: (newAngleDeg: number) => void
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 92;
    this.canvas.height = 92;
    this.canvas.className = 'wind-compass-canvas';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    const updateFromEvent = (e: PointerEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      if (Math.hypot(dx, dy) < 3) return;
      let deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
      if (deg < 0) deg += 360;
      this.angleDeg = deg;
      this.draw();
      this.onChange(deg);
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.canvas.setPointerCapture(e.pointerId);
      updateFromEvent(e);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (this.dragging) updateFromEvent(e);
    });
    this.canvas.addEventListener('pointerup', () => {
      this.dragging = false;
    });

    this.draw();
  }

  public setValues(angleDeg: number, speed: number): void {
    this.angleDeg = ((angleDeg % 360) + 360) % 360;
    this.speed = speed;
    this.draw();
  }

  public draw(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = 36;

    ctx.clearRect(0, 0, w, h);

    // Outer dial ring
    const bg = ctx.createRadialGradient(cx, cy, 4, cx, cy, r + 4);
    bg.addColorStop(0, '#1e1e1e');
    bg.addColorStop(1, '#0d0d0d');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(165, 165, 165, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tick marks every 45°
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const inner = i % 2 === 0 ? r - 6 : r - 3;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(161, 161, 161,0.65)' : 'rgba(161, 161, 161,0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * (r + 1), cy + Math.sin(a) * (r + 1));
      ctx.stroke();
    }

    // Cardinal labels (С = Up/270°, В = Right/0°, Ю = Down/90°, З = Left/180°)
    ctx.fillStyle = '#a1a1a1';
    ctx.font = '600 9px Roboto Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('С', cx, cy - r + 10);
    ctx.fillText('Ю', cx, cy + r - 10);
    ctx.fillText('З', cx - r + 10, cy);
    ctx.fillText('В', cx + r - 10, cy);

    // Wind vector arrow
    const rad = (this.angleDeg * Math.PI) / 180;
    const active = this.speed > 0.05;
    const len = active ? Math.min(r - 6, 14 + (this.speed / 40) * 18) : 16;
    const tx = cx + Math.cos(rad) * len;
    const ty = cy + Math.sin(rad) * len;
    const bx = cx - Math.cos(rad) * 10;
    const by = cy - Math.sin(rad) * 10;

    ctx.strokeStyle = active ? '#a5a5a5' : '#727272';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = active ? '#a5a5a5' : '#727272';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - Math.cos(rad - 0.5) * 8, ty - Math.sin(rad - 0.5) * 8);
    ctx.lineTo(tx - Math.cos(rad + 0.5) * 8, ty - Math.sin(rad + 0.5) * 8);
    ctx.closePath();
    ctx.fill();

    // Center pivot
    ctx.beginPath();
    ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = '#e7e7e7';
    ctx.fill();
  }
}
