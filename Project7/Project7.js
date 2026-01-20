
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
class App {
  constructor(config) {
    this.canvas = document.getElementById(config.canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.controlsContainer = document.getElementById(config.controlsId);
    this.container = document.getElementById(config.containerId);
    this.mode = config.mode;

    this.width = 400;
    this.height = 300;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.arm = new RobotArm(this.mode);

    this.camera = { zoom: 1.0, panX: 0, panY: 0 };
    this.isDragging = false;
    this.isPanning = false;
    this.lastMouse = { x: 0, y: 0 };
    this.rotationY = 0;

    this.uiRefs = {};

    this.init();
  }

  init() {
    this.setupListeners();
    let count = 3;
    if (this.mode.includes('3D')) count = 4;
    this.setLinkCount(count);
    this.loop();
  }

  setupListeners() {
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    if (this.container) {
      const resetBtn = this.container.querySelector('[data-action="reset"]');
      if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

      const recenterBtn = this.container.querySelector('[data-action="recenter"]');
      if (recenterBtn) recenterBtn.addEventListener('click', () => this.recenter());

      const autoRotate = this.container.querySelector('input[type="checkbox"]');
      if (autoRotate) autoRotate.addEventListener('change', (e) => { this.autoRotate = e.target.checked; });
    }
  }

  handleWheel(e) { /* ... unchanged ... */
    e.preventDefault();
    const zoomSensitivity = 0.001;
    this.camera.zoom -= e.deltaY * zoomSensitivity;
    this.camera.zoom = Math.max(0.1, Math.min(5.0, this.camera.zoom));
  }

  handleMouseDown(e) { /* ... unchanged ... */
    const x = e.clientX;
    const y = e.clientY;
    this.lastMouse = { x, y };

    if (e.button === 2 || e.shiftKey) {
      this.isPanning = true;
      this.canvas.style.cursor = 'move';
    } else {
      if (this.mode.includes('IK')) {
        this.isDragging = true;
        this.handleIKInput(x, y);
      }
    }
  }

  handleMouseMove(e) { /* ... unchanged ... */
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
    this.canvas.style.cursor = 'default';
  }

  handleIKInput(clientX, clientY) { /* ... unchanged ... */
    const rect = this.canvas.getBoundingClientRect();
    const mouseXCanvas = clientX - rect.left;
    const mouseYCanvas = clientY - rect.top;
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const screenX = mouseXCanvas * scaleX;
    const screenY = mouseYCanvas * scaleY;

    const cx = (this.width / 2) + this.camera.panX;
    const cy = (this.height / 2 + 50) + this.camera.panY;
    const visualScale = this.getScale();

    if (this.mode.includes('2D')) {
      const worldX = (screenX - cx) / visualScale;
      const worldY = (cy - screenY) / visualScale;
      this.arm.target.x = worldX;
      this.arm.target.y = worldY;
      this.arm.target.z = 0;
    } else {
      const worldX = (screenX - cx) / visualScale;
      const worldY = (cy - screenY) / visualScale;
      this.arm.target.x = worldX;
      this.arm.target.y = worldY;
    }

    // Update Target Inputs
    this.updateTargetInputs();
  }

  recenter() { this.camera = { zoom: 1.0, panX: 0, panY: 0 }; }

  setLinkCount(n) {
    n = Math.max(1, Math.min(10, n));

    const currentJoints = this.arm.getJoints();
    const newJoints = [];

    for (let i = 0; i < n; i++) {
      if (currentJoints[i]) newJoints.push(currentJoints[i]);
      else {
        newJoints.push({
          length: Math.max(25, 80 * Math.pow(0.85, i)),
          theta: 0.1,
          axis: 'z'
        });
      }
    }
    this.arm.setJoints(newJoints);
    this.rebuildInputs();
  }

  rebuildInputs() {
    if (!this.controlsContainer) return;
    this.controlsContainer.innerHTML = '';

    // --- 1. Header: Link Count Controls ---
    const headerRow = document.createElement('div');
    headerRow.className = 'control-row header';
    headerRow.style.justifyContent = 'space-between';
    headerRow.style.marginBottom = '10px';
    headerRow.style.borderBottom = '1px dashed #333';
    headerRow.style.paddingBottom = '5px';

    const label = document.createElement('span');
    label.textContent = `LINKS: ${this.arm.getJoints().length}`;
    label.style.fontFamily = 'var(--font-tech)';
    label.style.fontSize = '0.75rem';
    label.style.color = 'var(--text-muted)';

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '5px';

    const minusBtn = document.createElement('button');
    minusBtn.textContent = '-';
    minusBtn.className = 'btn-xs';
    minusBtn.addEventListener('click', () => this.setLinkCount(this.arm.getJoints().length - 1));

    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.className = 'btn-xs';
    plusBtn.addEventListener('click', () => this.setLinkCount(this.arm.getJoints().length + 1));

    btnGroup.appendChild(minusBtn);
    btnGroup.appendChild(plusBtn);
    headerRow.appendChild(label);
    headerRow.appendChild(btnGroup);
    this.controlsContainer.appendChild(headerRow);

    // --- 2. IK Target Inputs (If IK Mode) ---
    if (this.mode.includes('IK')) {
      const targetRow = document.createElement('div');
      targetRow.className = 'control-row target-inputs';
      targetRow.style.marginBottom = '15px';

      // X Input
      const tx = this.createInput('X', this.arm.target.x, (v) => this.arm.target.x = v);
      const ty = this.createInput('Y', this.arm.target.y, (v) => this.arm.target.y = v);
      targetRow.appendChild(tx.label); targetRow.appendChild(tx.input);
      targetRow.appendChild(ty.label); targetRow.appendChild(ty.input);

      // Add to uiRefs for auto-update
      this.uiRefs.targetX = tx.input;
      this.uiRefs.targetY = ty.input;

      if (this.mode.includes('3D')) {
        const tz = this.createInput('Z', this.arm.target.z || 0, (v) => this.arm.target.z = v);
        targetRow.appendChild(tz.label); targetRow.appendChild(tz.input);
        this.uiRefs.targetZ = tz.input;
      }
      this.controlsContainer.appendChild(targetRow);
    }

    // --- 3. Link Rows ---
    const joints = this.arm.getJoints();
    joints.forEach((j, i) => {
      const row = document.createElement('div');
      row.className = 'control-row';

      const lLabel = document.createElement('label');
      lLabel.textContent = `L${i + 1}`;

      const lInp = document.createElement('input');
      lInp.type = 'number';
      lInp.value = Math.round(j.length);
      lInp.addEventListener('input', (e) => { j.length = parseFloat(e.target.value); });

      row.appendChild(lLabel);
      row.appendChild(lInp);

      // Angle: If FK, Editable. If IK, Read-Only.
      const tInp = document.createElement('input');
      tInp.type = 'number';
      tInp.value = Math.round(Math3D.toDeg(j.theta));
      tInp.step = 5;

      if (this.mode.includes('IK')) {
        tInp.readOnly = true;
        tInp.style.opacity = '0.6';
        tInp.style.borderStyle = 'dashed';
        tInp.title = 'Calculated Angle';
        // Store ref to update in loop
        j._domInput = tInp;
      } else {
        tInp.addEventListener('input', (e) => { j.theta = Math3D.toRad(parseFloat(e.target.value)); });
      }
      row.appendChild(tInp);

      if (this.mode.includes('3D')) {
        const axisSel = document.createElement('select');
        ['x', 'y', 'z'].forEach(ax => {
          const opt = document.createElement('option');
          opt.value = ax;
          opt.text = ax.toUpperCase();
          if (j.axis === ax) opt.selected = true;
          axisSel.appendChild(opt);
        });
        axisSel.addEventListener('change', (e) => { j.axis = e.target.value; });
        row.appendChild(axisSel);
      }

      this.controlsContainer.appendChild(row);
    });

    // --- 4. Output Section ---
    const outputRow = document.createElement('div');
    outputRow.className = 'output-row';
    outputRow.textContent = '...';
    this.controlsContainer.appendChild(outputRow);
    this.uiRefs.output = outputRow;
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

  updateTargetInputs() {
    if (!this.mode.includes('IK')) return;

    if (this.uiRefs.targetX && document.activeElement !== this.uiRefs.targetX)
      this.uiRefs.targetX.value = this.arm.target.x.toFixed(0);

    if (this.uiRefs.targetY && document.activeElement !== this.uiRefs.targetY)
      this.uiRefs.targetY.value = this.arm.target.y.toFixed(0);

    if (this.mode.includes('3D') && this.uiRefs.targetZ && document.activeElement !== this.uiRefs.targetZ)
      this.uiRefs.targetZ.value = this.arm.target.z.toFixed(0);
  }

  updateOutputs(fkResult) {
    if (!this.uiRefs.output) return;

    const endEffector = fkResult.positions[fkResult.positions.length - 1];
    const x = endEffector.x.toFixed(1);
    const y = endEffector.y.toFixed(1);
    const z = endEffector.z.toFixed(1);

    if (this.mode.includes('IK')) {
      // Show Joint Angles (Solution)
      const angles = this.arm.getJoints().map(j => Math.round(Math3D.toDeg(j.theta))).join(', ');
      this.uiRefs.output.textContent = `> SOLUTION:\nAngles: [${angles}]`;
    } else {
      // Show End Effector Position (Result)
      if (this.mode.includes('3D')) {
        this.uiRefs.output.textContent = `> END_EFFECTOR:\nX:${x}  Y:${y}  Z:${z}`;
      } else {
        this.uiRefs.output.textContent = `> END_EFFECTOR:\nX:${x}  Y:${y}`;
      }
    }
  }

  reset() {
    this.arm.getJoints().forEach(j => j.theta = 0);
    this.recenter();
  }

  getScale() {
    const totalLen = this.arm.getJoints().reduce((s, j) => s + j.length, 0);
    const minDim = Math.min(this.width, this.height);
    const baseScale = (minDim * 0.45) / (totalLen || 1);
    return baseScale * this.camera.zoom;
  }

  loop() {
    if (this.mode.includes('IK')) {
      this.arm.solveIK();
      // Update the read-only angle inputs
      this.arm.getJoints().forEach(j => {
        if (j._domInput) j._domInput.value = Math.round(Math3D.toDeg(j.theta));
      });
    }

    if (this.autoRotate && this.mode.includes('3D')) {
      this.rotationY += 0.01;
    } else {
      if (!this.autoRotate) this.rotationY = 0;
    }

    const fkResult = this.arm.solveFK();
    this.updateOutputs(fkResult);
    this.render(fkResult);

    requestAnimationFrame(() => this.loop());
  }

  render(fkResult) {
    // ... (Render logic unchanged) ...
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = (this.width / 2) + this.camera.panX;
    const cy = (this.height / 2 + 50) + this.camera.panY;
    const scale = this.getScale();

    this.drawGrid(cx, cy, scale);
    this.drawReach(cx, cy, scale);

    // IK Target
    if (this.mode.includes('IK')) {
      let tScreen;
      if (this.mode.includes('3D')) {
        tScreen = Math3D.project(this.orbit(this.arm.target), this.width, this.height, scale, cx, cy);
      } else {
        tScreen = { x: cx + this.arm.target.x * scale, y: cy - this.arm.target.y * scale };
      }

      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(tScreen.x, tScreen.y, 8 * this.camera.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0ff';
      ctx.beginPath();
      ctx.arc(tScreen.x, tScreen.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Arm
    const positions = fkResult.positions;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

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

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = `rgba(255, 77, 0, ${alpha})`;
      ctx.lineWidth = 5 * this.camera.zoom;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(start.x, start.y, 3 * this.camera.zoom, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
  }

  orbit(p) {
    if (this.rotationY === 0) return p;
    const cos = Math.cos(this.rotationY);
    const sin = Math.sin(this.rotationY);
    return {
      x: p.x * cos - p.z * sin,
      y: p.y,
      z: p.x * sin + p.z * cos
    };
  }

  drawGrid(cx, cy, scale) { /* ... unchanged ... */
    const ctx = this.ctx;
    const step = 20 * scale;

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const xStart = 0; const xEnd = this.width;
    const yStart = 0; const yEnd = this.height;

    for (let x = cx; x < xEnd; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, this.height); }
    for (let x = cx; x > xStart; x -= step) { ctx.moveTo(x, 0); ctx.lineTo(x, this.height); }

    for (let y = cy; y < yEnd; y += step) { ctx.moveTo(0, y); ctx.lineTo(this.width, y); }
    for (let y = cy; y > yStart; y -= step) { ctx.moveTo(0, y); ctx.lineTo(this.width, y); }

    ctx.stroke();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, this.height);
    ctx.moveTo(0, cy); ctx.lineTo(this.width, cy);
    ctx.stroke();
  }

  drawReach(cx, cy, scale) { /* ... unchanged ... */
    const ctx = this.ctx;
    const totalLen = this.arm.getJoints().reduce((s, j) => s + j.length, 0);

    ctx.strokeStyle = 'rgba(255, 77, 0, 0.15)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, totalLen * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
