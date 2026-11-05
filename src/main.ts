import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/700.css';
import './style.css';
import { AppUI } from './ui/AppUI';

const appRoot = document.getElementById('app');
if (appRoot) {
  new AppUI(appRoot);
}
