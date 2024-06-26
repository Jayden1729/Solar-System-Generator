export class Star {
  constructor(data) {
    this.systemName = data["sy_name"];
    this.hostName = data["hostname"];
    this.stellarRadius = data["st_rad"];
    this.stellarMass = data["st_mass"];
    this.stellarDensity = data["st_dens"];
    this.ra = data["ra"];
    this.dec = data["dec"];
    this.systemDistance = data["sy_dist"];
  }
}
