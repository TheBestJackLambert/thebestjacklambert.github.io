
// ============================================================================
// PROJECT 7: ADVANCED KINEMATICS VISUALIZER
// Supports: Multi-Instance 2D/3D FK/IK
// Author: Jack Lambert
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Instantiate 4 separate visualizers
  const vizFK2D = new App({
    canvasId: 'canvas-fk2d',
    controlsId: 'controls-fk2d',
    containerId: 'viz-container-fk2d',
    mode: '2D_FK'
  });

  const vizIK2D = new App({
    canvasId: 'canvas-ik2d',
    controlsId: 'controls-ik2d',
    containerId: 'viz-container-ik2d',
    mode: '2D_IK'
  });

  const vizFK3D = new App({
    canvasId: 'canvas-fk3d',
    controlsId: 'controls-fk3d',
    containerId: 'viz-container-fk3d',
    mode: '3D_FK'
  });

  const vizIK3D = new App({
    canvasId: 'canvas-ik3d',
    controlsId: 'controls-ik3d',
    containerId: 'viz-container-ik3d',
    mode: '3D_IK'
  });
});

/* ============================================================================
   MATH & ALGORITHMS
   ============================================================================ */
class Math3D {
  static toRad(deg) { return deg * Math.PI / 180; }
  static toDeg(rad) { return rad * 180 / Math.PI; }

  static multiplyMatrix(A, B) {
    const C = new Array(4).fill(0).map(() => new Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          C[i][j] += A[i][k] * B[k][j];
        }
      }
    }
    return C;
  }

  static identity() {
    return [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  }

  static translate(x, y, z) {
    return [
      [1, 0, 0, x],
      [0, 1, 0, y],
      [0, 0, 1, z],
      [0, 0, 0, 1]
    ];
  }

  static rotateX(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return [
      [1, 0, 0, 0],
      [0, c, -s, 0],
      [0, s, c, 0],
      [0, 0, 0, 1]
    ];
  }

  static rotateY(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return [
      [c, 0, s, 0],
      [0, 1, 0, 0],
      [-s, 0, c, 0],
      [0, 0, 0, 1]
    ];
  }

  static rotateZ(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return [
      [c, -s, 0, 0],
      [s, c, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  }

  static project(point, width, height, scale, cx, cy) {
    const fov = 400;
    const dist = 500;
    const x = point.x * scale;
    const y = point.y * scale;
    const z = point.z * scale;

    const factor = fov / (dist + z);

    const screenX = (x * factor) + cx;
    const screenY = cy - (y * factor);

    return { x: screenX, y: screenY, z: z, scale: factor };
  }
}

/* ============================================================================
   ROBOT ARM LOGIC
   ============================================================================ */
class RobotArm {
  constructor(mode) {
    this.joints = [];
    this.mode = mode;
    this.target = { x: 100, y: 100, z: 0 };
  }

  updateJoint(index, props) {
    if (this.joints[index]) Object.assign(this.joints[index], props);
  }

  setJoints(configs) { this.joints = configs; }
  getJoints() { return this.joints; }

  solveFK() {
    let currentMat = Math3D.identity();
    const positions = [{ x: 0, y: 0, z: 0 }];

    for (const joint of this.joints) {
      let rotMat;
      if (this.mode.includes('2D')) {
        rotMat = Math3D.rotateZ(joint.theta);
      } else {
        if (joint.axis === 'x') rotMat = Math3D.rotateX(joint.theta);
        else if (joint.axis === 'y') rotMat = Math3D.rotateY(joint.theta);
        else rotMat = Math3D.rotateZ(joint.theta);
      }

      const transMat = Math3D.translate(joint.length, 0, 0);
      currentMat = Math3D.multiplyMatrix(currentMat, rotMat);
      currentMat = Math3D.multiplyMatrix(currentMat, transMat);

      positions.push({
        x: currentMat[0][3],
        y: currentMat[1][3],
        z: currentMat[2][3]
      });
    }
    return { positions, finalMat: currentMat };
  }

  solveIK() {
    if (!this.mode.includes('IK')) return;

    const iterations = 10;
    for (let iter = 0; iter < iterations; iter++) {
      let { positions } = this.solveFK();

      for (let i = this.joints.length - 1; i >= 0; i--) {
        const jointPos = positions[i];
        const eePos = positions[positions.length - 1];

        const toEE = { x: eePos.x - jointPos.x, y: eePos.y - jointPos.y, z: eePos.z - jointPos.z };
        const toTarget = { x: this.target.x - jointPos.x, y: this.target.y - jointPos.y, z: this.target.z - jointPos.z };

        const magEE = Math.sqrt(toEE.x ** 2 + toEE.y ** 2 + toEE.z ** 2);
        const magTarget = Math.sqrt(toTarget.x ** 2 + toTarget.y ** 2 + toTarget.z ** 2);

        if (magEE < 1e-4 || magTarget < 1e-4) continue;

        if (this.mode.includes('2D')) {
          const curAngle = Math.atan2(toEE.y, toEE.x);
          const targetAngle = Math.atan2(toTarget.y, toTarget.x);
          let diff = targetAngle - curAngle;

          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;

          this.joints[i].theta += diff;
        } else {
          let u, v, u_t, v_t;

          if (this.joints[i].axis === 'z') { u = toEE.x; v = toEE.y; u_t = toTarget.x; v_t = toTarget.y; }
          else if (this.joints[i].axis === 'y') { u = toEE.z; v = toEE.x; u_t = toTarget.z; v_t = toTarget.x; }
          else { u = toEE.y; v = toEE.z; u_t = toTarget.y; v_t = toTarget.z; }

          const curAng = Math.atan2(v, u);
          const tarAng = Math.atan2(v_t, u_t);
          let diff = tarAng - curAng;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;

          this.joints[i].theta += diff * 0.5;
        }

        positions = this.solveFK().positions;
      }
    }
  }
}

/* ============================================================================
   APP CONTROLLER (INSTANCE)
   ============================================================================ */
/* ============================================================================
   APP CONTROLLER (INSTANCE) - VECTOR SVW VERSION
   ============================================================================ */
class App {
  constructor(config) {
    this.svg = document.getElementById(config.canvasId);
    if (!this.svg) return;

    this.controlsContainer = document.getElementById(config.controlsId);
    this.container = document.getElementById(config.containerId);
    this.mode = config.mode;
    this.svgNS = "http://www.w3.org/2000/svg";

    this.width = 400;
    this.height = 300;
    // SVGs scale automatically, but we set internal viewBox
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    this.arm = new RobotArm(this.mode);

    this.camera = { zoom: 1.0, panX: 0, panY: 0 };
    this.isDragging = false;
    this.isPanning = false;
    this.lastMouse = { x: 0, y: 0 };
    this.rotationY = 0;

    this.uiRefs = {};

    // SVG Groups for layering
    this.groups = {};

    this.init();
  }

  init() {
    this.createLayers();
    this.setupListeners();
    let count = 3;
    if (this.mode.includes('3D')) count = 4;
    this.setLinkCount(count);
    this.loop();
  }

  createLayers() {
    // Clear existing
    this.svg.innerHTML = '';

    // Background Color
    const bg = document.createElementNS(this.svgNS, 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', '#0a0a0a'); // Match theme
    this.svg.appendChild(bg);

    // Create groups in order
    ['grid', 'reach', 'arm', 'target'].forEach(name => {
      const g = document.createElementNS(this.svgNS, 'g');
      g.id = `${name}-layer`;
      this.svg.appendChild(g);
      this.groups[name] = g;
    });
  }

  setupListeners() {
    this.svg.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    this.svg.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());
    this.svg.addEventListener('contextmenu', (e) => e.preventDefault());

    if (this.container) {
      const resetBtn = this.container.querySelector('[data-action="reset"]');
      if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

      const recenterBtn = this.container.querySelector('[data-action="recenter"]');
      if (recenterBtn) recenterBtn.addEventListener('click', () => this.recenter());

      const autoRotate = this.container.querySelector('input[type="checkbox"]');
      if (autoRotate) autoRotate.addEventListener('change', (e) => { this.autoRotate = e.target.checked; });
    }
  }

  handleWheel(e) {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    this.camera.zoom -= e.deltaY * zoomSensitivity;
    this.camera.zoom = Math.max(0.1, Math.min(5.0, this.camera.zoom));
  }

  handleMouseDown(e) {
    const x = e.clientX;
    const y = e.clientY;
    this.lastMouse = { x, y };

    if (e.button === 2 || e.shiftKey) {
      this.isPanning = true;
      this.svg.style.cursor = 'move';
    } else {
      if (this.mode.includes('IK')) {
        this.isDragging = true;
        this.handleIKInput(x, y);
      }
    }
  }

  handleMouseMove(e) {
    if (this.isPanning) {
      const dx = e.clientX - this.lastMouse.x;
      const dy = e.clientY - this.lastMouse.y;
      this.camera.panX += dx;
      this.camera.panY += dy;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    } else if (this.isDragging && this.mode.includes('IK')) {
      this.handleIKInput(e.clientX, e.clientY);
    }
  }

  handleMouseUp() {
    this.isPanning = false;
    this.isDragging = false;
    this.svg.style.cursor = 'default';
  }

  handleIKInput(clientX, clientY) {
    const rect = this.svg.getBoundingClientRect();
    const splitScaleX = this.width / rect.width;
    const splitScaleY = this.height / rect.height;

    // Mouse relative to SVG 0,0 (in viewbox coords)
    const mouseX = (clientX - rect.left) * splitScaleX;
    const mouseY = (clientY - rect.top) * splitScaleY;

    // Visual Center (adjusted by pan)
    const cx = (this.width / 2) + this.camera.panX;
    const cy = (this.height / 2 + 50) + this.camera.panY;
    const visualScale = this.getScale();

    // Invert the projection
    const screenX = mouseX;
    const screenY = mouseY;

    if (this.mode.includes('2D')) {
      const worldX = (screenX - cx) / visualScale;
      // Y is flipped in Canvas/SVG relative to Cartestian
      const worldY = (cy - screenY) / visualScale;

      this.arm.target.x = worldX;
      this.arm.target.y = worldY;
      this.arm.target.z = 0;
    } else {
      const worldX = (screenX - cx) / visualScale;
      const worldY = (cy - screenY) / visualScale;
      // For 3D mouse input, we map 2D plane to x/y, Z needs discrete control
      this.arm.target.x = worldX;
      this.arm.target.y = worldY;
    }

    this.updateTargetInputs();
  }

  recenter() { this.camera = { zoom: 1.0, panX: 0, panY: 0 }; }

  setLinkCount(n) {
    n = Math.max(1, Math.min(10, n));
    const currentJoints = this.arm.getJoints();
    const newJoints = [];
    for (let i = 0; i < n; i++) {
      if (currentJoints[i]) newJoints.push(currentJoints[i]);
      else newJoints.push({ length: Math.max(25, 80 * Math.pow(0.85, i)), theta: 0.1, axis: 'z' });
    }
    this.arm.setJoints(newJoints);
    this.rebuildInputs();
  }

  rebuildInputs() {
    // (Same logic as Canvas version, kept brevity)
    if (!this.controlsContainer) return;
    this.controlsContainer.innerHTML = '';

    // HEADER
    const headerRow = document.createElement('div');
    headerRow.className = 'control-row header';
    headerRow.style.cssText = 'justify-content:space-between; margin-bottom:10px; border-bottom:1px dashed #333; padding-bottom:5px';

    const label = document.createElement('span');
    label.innerText = `LINKS: ${this.arm.getJoints().length}`;
    label.style.cssText = 'font-family:var(--font-tech); font-size:0.75rem; color:var(--text-muted)';

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '5px';

    const minus = document.createElement('button'); minus.className = 'btn-xs'; minus.innerText = '-';
    minus.onclick = () => this.setLinkCount(this.arm.getJoints().length - 1);

    const plus = document.createElement('button'); plus.className = 'btn-xs'; plus.innerText = '+';
    plus.onclick = () => this.setLinkCount(this.arm.getJoints().length + 1);

    btnGroup.append(minus, plus);
    headerRow.append(label, btnGroup);
    this.controlsContainer.append(headerRow);

    // TARGET INPUTS
    if (this.mode.includes('IK')) {
      const row = document.createElement('div');
      row.className = 'control-row target-inputs';
      row.style.marginBottom = '15px';

      const tx = this.createInput('X', this.arm.target.x, v => this.arm.target.x = v);
      const ty = this.createInput('Y', this.arm.target.y, v => this.arm.target.y = v);
      row.append(tx.label, tx.input, ty.label, ty.input);
      this.uiRefs.targetX = tx.input;
      this.uiRefs.targetY = ty.input;

      if (this.mode.includes('3D')) {
        const tz = this.createInput('Z', this.arm.target.z || 0, v => this.arm.target.z = v);
        row.append(tz.label, tz.input);
        this.uiRefs.targetZ = tz.input;
      }
      this.controlsContainer.append(row);
    }

    // LINKS
    this.arm.getJoints().forEach((j, i) => {
      const row = document.createElement('div');
      row.className = 'control-row';

      const lbl = document.createElement('label'); lbl.innerText = `L${i + 1}`;
      const lInp = document.createElement('input'); lInp.type = 'number'; lInp.value = Math.round(j.length);
      lInp.oninput = e => j.length = parseFloat(e.target.value);
      row.append(lbl, lInp);

      const tInp = document.createElement('input'); tInp.type = 'number';
      tInp.value = Math.round(Math3D.toDeg(j.theta)); tInp.step = 5;
      if (this.mode.includes('IK')) {
        tInp.readOnly = true; tInp.style.opacity = '0.6'; tInp.style.borderStyle = 'dashed';
        j._domInput = tInp;
      } else {
        tInp.oninput = e => j.theta = Math3D.toRad(parseFloat(e.target.value));
      }
      row.append(tInp);

      if (this.mode.includes('3D')) {
        const sel = document.createElement('select');
        ['x', 'y', 'z'].forEach(ax => {
          const opt = document.createElement('option'); opt.value = ax; opt.text = ax.toUpperCase();
          if (j.axis === ax) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.onchange = e => j.axis = e.target.value;
        row.appendChild(sel);
      }
      this.controlsContainer.appendChild(row);
    });

    const outRow = document.createElement('div');
    outRow.className = 'output-row';
    this.controlsContainer.append(outRow);
    this.uiRefs.output = outRow;
  }

  createInput(labelName, val, callback) {
    const label = document.createElement('label');
    label.textContent = labelName;
    label.style.color = 'var(--primary-color)';

    const input = document.createElement('input');
    input.type = 'number';
    input.value = Math.round(val);
    input.addEventListener('input', (e) => callback(parseFloat(e.target.value)));

    return { label, input };
  }

  updateTargetInputs() { /* Same as before */
    if (!this.mode.includes('IK')) return;
    if (this.uiRefs.targetX && document.activeElement !== this.uiRefs.targetX) this.uiRefs.targetX.value = this.arm.target.x.toFixed(0);
    if (this.uiRefs.targetY && document.activeElement !== this.uiRefs.targetY) this.uiRefs.targetY.value = this.arm.target.y.toFixed(0);
    if (this.mode.includes('3D') && this.uiRefs.targetZ && document.activeElement !== this.uiRefs.targetZ) this.uiRefs.targetZ.value = this.arm.target.z.toFixed(0);
  }

  updateOutputs(fkResult) { /* Same as before */
    if (!this.uiRefs.output) return;
    const ee = fkResult.positions[fkResult.positions.length - 1];
    const x = ee.x.toFixed(1); const y = ee.y.toFixed(1); const z = ee.z.toFixed(1);

    if (this.mode.includes('IK')) {
      const angles = this.arm.getJoints().map(j => Math.round(Math3D.toDeg(j.theta))).join(', ');
      this.uiRefs.output.textContent = `> SOLUTION:\nAngles: [${angles}]`;
    } else {
      if (this.mode.includes('3D')) this.uiRefs.output.textContent = `> END_EFFECTOR:\nX:${x}  Y:${y}  Z:${z}`;
      else this.uiRefs.output.textContent = `> END_EFFECTOR:\nX:${x}  Y:${y}`;
    }
  }

  reset() { this.arm.getJoints().forEach(j => j.theta = 0); this.recenter(); }

  getScale() {
    const totalLen = this.arm.getJoints().reduce((s, j) => s + j.length, 0);
    const minDim = Math.min(this.width, this.height);
    const baseScale = (minDim * 0.45) / (totalLen || 1);
    return baseScale * this.camera.zoom;
  }

  loop() {
    if (this.mode.includes('IK')) {
      this.arm.solveIK();
      this.arm.getJoints().forEach(j => {
        if (j._domInput) j._domInput.value = Math.round(Math3D.toDeg(j.theta));
      });
    }

    if (this.autoRotate && this.mode.includes('3D')) {
      this.rotationY += 0.01;
    } else if (!this.autoRotate) {
      this.rotationY = 0;
    }

    const fkResult = this.arm.solveFK();
    this.updateOutputs(fkResult);
    this.render(fkResult);
    requestAnimationFrame(() => this.loop());
  }

  // --- VECTOR RENDERER ---
  render(fkResult) {
    const cx = (this.width / 2) + this.camera.panX;
    const cy = (this.height / 2 + 50) + this.camera.panY;
    const scale = this.getScale();
    const positions = fkResult.positions;

    // 1. Draw Grid
    this.renderGrid(cx, cy, scale);

    // 2. Draw Reach Radius
    this.renderReach(cx, cy, scale);

    // 3. Draw Target (IK Only)
    this.renderTarget(cx, cy, scale);

    // 4. Draw Arm
    this.renderArm(positions, cx, cy, scale);
  }

  renderGrid(cx, cy, scale) {
    const group = this.groups.grid;
    // Simple approach: Clear and redraw path (efficient enough for SVG usually)
    // Optimization: Reuse path element
    let path = group.firstElementChild;
    if (!path) {
      path = document.createElementNS(this.svgNS, 'path');
      path.setAttribute('stroke', '#1a1a1a');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('fill', 'none');
      group.appendChild(path);
    }

    // Axes line
    let axesPath = group.children[1];
    if (!axesPath) {
      axesPath = document.createElementNS(this.svgNS, 'path');
      axesPath.setAttribute('stroke', '#333');
      axesPath.setAttribute('stroke-width', '2');
      axesPath.setAttribute('fill', 'none');
      group.appendChild(axesPath);
    }

    const step = 20 * scale;
    let d = '';
    const w = this.width; const h = this.height;

    // Grid lines
    if (step > 2) { // Don't render ridiculously dense grids
      let startX = cx % step;
      if (startX < 0) startX += step;
      for (let x = startX; x <= w; x += step) d += `M${x},0 L${x},${h} `;

      let startY = cy % step;
      if (startY < 0) startY += step;
      for (let y = startY; y <= h; y += step) d += `M0,${y} L${w},${y} `;
    }
    path.setAttribute('d', d);

    // Axes
    axesPath.setAttribute('d', `M${cx},0 L${cx},${h} M0,${cy} L${w},${cy}`);
  }

  renderReach(cx, cy, scale) {
    const group = this.groups.reach;
    const totalLen = this.arm.getJoints().reduce((s, j) => s + j.length, 0);
    const r = totalLen * scale;

    let circle = group.firstElementChild;
    if (!circle) {
      circle = document.createElementNS(this.svgNS, 'circle');
      circle.setAttribute('stroke', 'rgba(255, 77, 0, 0.15)');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke-dasharray', '5,5');
      group.appendChild(circle);
    }
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', Math.max(0, r));
  }

  renderTarget(cx, cy, scale) {
    const group = this.groups.target;
    group.innerHTML = ''; // lazy clear

    if (this.mode.includes('IK')) {
      let tScreen;
      if (this.mode.includes('3D')) {
        tScreen = Math3D.project(this.orbit(this.arm.target), this.width, this.height, scale, cx, cy);
      } else {
        tScreen = { x: cx + this.arm.target.x * scale, y: cy - this.arm.target.y * scale };
      }

      const halo = document.createElementNS(this.svgNS, 'circle');
      halo.setAttribute('cx', tScreen.x); halo.setAttribute('cy', tScreen.y);
      halo.setAttribute('r', 8 * this.camera.zoom);
      halo.setAttribute('fill', 'rgba(0, 255, 255, 0.3)');
      group.appendChild(halo);

      const dot = document.createElementNS(this.svgNS, 'circle');
      dot.setAttribute('cx', tScreen.x); dot.setAttribute('cy', tScreen.y);
      dot.setAttribute('r', 3);
      dot.setAttribute('fill', '#0ff');
      group.appendChild(dot);
    }
  }

  renderArm(positions, cx, cy, scale) {
    const group = this.groups.arm;
    group.innerHTML = ''; // lazy clear for dynamic number of links

    const projected = positions.map(p => {
      if (this.mode.includes('3D')) {
        return Math3D.project(this.orbit(p), this.width, this.height, scale, cx, cy);
      } else {
        return { x: cx + p.x * scale, y: cy - p.y * scale, z: 0 };
      }
    });

    for (let i = 0; i < projected.length - 1; i++) {
      const start = projected[i];
      const end = projected[i + 1];
      const zAvg = (start.z + end.z) / 2;
      const alpha = this.mode.includes('3D') ? Math.max(0.2, 1 - (zAvg / 1000)) : 1;

      const line = document.createElementNS(this.svgNS, 'line');
      line.setAttribute('x1', start.x); line.setAttribute('y1', start.y);
      line.setAttribute('x2', end.x); line.setAttribute('y2', end.y);
      line.setAttribute('stroke', `rgba(255, 77, 0, ${alpha})`);
      line.setAttribute('stroke-width', 5 * this.camera.zoom);
      line.setAttribute('stroke-linecap', 'round');
      group.appendChild(line);

      const joint = document.createElementNS(this.svgNS, 'circle');
      joint.setAttribute('cx', start.x); joint.setAttribute('cy', start.y);
      joint.setAttribute('r', 3 * this.camera.zoom);
      joint.setAttribute('fill', '#fff');
      group.appendChild(joint);
    }
  }

  orbit(p) { /* Same as before */
    if (this.rotationY === 0) return p;
    const cos = Math.cos(this.rotationY);
    const sin = Math.sin(this.rotationY);
    return {
      x: p.x * cos - p.z * sin,
      y: p.y,
      z: p.x * sin + p.z * cos
    };
  }
}
