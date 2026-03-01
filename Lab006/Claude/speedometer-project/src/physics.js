export class PhysicsEngine {
  constructor() {
    this.velocity = 0; // km/h
    this.acceleration = 0; // m/s²
    this.maxVelocity = 200; // km/h
    this.accelerationPower = 6; // m/s²
    this.brakePower = -8; // m/s²
    this.friction = -0.5; // m/s² (resistência do ar)
    this.isAccelerating = false;
    this.isBraking = false;
  }

  update(deltaTime) {
    // Converter deltaTime para segundos
    const dt = deltaTime / 1000;

    // Definir aceleração baseado nas ações
    if (this.isAccelerating && this.velocity < this.maxVelocity) {
      this.acceleration = this.accelerationPower;
    } else if (this.isBraking) {
      this.acceleration = this.brakePower;
    } else {
      // Desaceleração natural (fricção/resistência do ar)
      this.acceleration = this.friction;
    }

    // Aplicar aceleração à velocidade
    this.velocity += this.acceleration * dt;

    // Limitar velocidade mínima (não pode ser negativa)
    if (this.velocity < 0) {
      this.velocity = 0;
      this.acceleration = 0;
    }

    // Limitar velocidade máxima
    if (this.velocity > this.maxVelocity) {
      this.velocity = this.maxVelocity;
    }

    // Reduzir aceleração gradualmente quando não está acelerando
    if (!this.isAccelerating && !this.isBraking && this.velocity > 0) {
      this.acceleration = this.friction;
    }
  }

  setAccelerating(value) {
    this.isAccelerating = value;
  }

  setBraking(value) {
    this.isBraking = value;
  }

  reset() {
    this.velocity = 0;
    this.acceleration = 0;
    this.isAccelerating = false;
    this.isBraking = false;
  }

  getVelocity() {
    return this.velocity;
  }

  getAcceleration() {
    return this.acceleration;
  }
}
