import './style.css';
import { AppUI } from './ui/AppUI';

const appRoot = document.getElementById('app');
if (appRoot) {
  new AppUI(appRoot);
}
