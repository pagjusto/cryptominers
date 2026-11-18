import { execSync } from 'child_process';
try {
  const py = execSync('python --version', { encoding: 'utf-8' });
  console.log('Python:', py.trim());
  const pyModules = execSync('python -c "import PIL; print(\'PIL version:\', PIL.__version__)"', { encoding: 'utf-8' });
  console.log(pyModules.trim());
} catch (e) {
  console.log('Python check error:', e.message);
}
