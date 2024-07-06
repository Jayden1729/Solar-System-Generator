export class Planet {
  constructor(data) {
    this.name = data["pl_name"];
    this.hostName = data["hostname"];
    this.orbitalPeriod = data["pl_orbper"];
    this.semiMajorAxis = data["pl_orbsmax"];
    this.radius = data["pl_radj"];
    this.mass = data["pl_bmassj"];
    this.density = data["pl_dens"];
    this.orbitalEccentricity = data["pl_orbeccen"];
    this.orbitalInclination = data["pl_orbincl"];
    this.ra = data["ra"];
    this.dec = data["dec"];
    this.orbitBinary = data["cb_flag"];
    this.numMoons = data["sy_mnum"];
    this.semiMinorAxis =
      this.semiMajorAxis * Math.sqrt(1 - Math.pow(this.orbitalEccentricity, 2));
    this.assumptions = [];
    this.fixMassRadius();
  }

  /**
   * Fixes the mass and radius if either value is missing, and adds strings to
   * this.assumptions describing the assumptions made about this planet.
   *
   * If both are missing, the radius is set to between 0.005 - 0.035 jupiter
   * masses, as this is the most common range for exoplanet masses.
   *
   * If only the mass or radius are missing, the required value is calculated
   * from the mass-radius relation for exoplanets.
   */
  fixMassRadius() {
    if (this.radius === null && this.mass === null) {
      // If no recorded mass, sets mass to between 0.005 - 0.035 jupiter masses,
      // as this is the most common range for exoplanet masses.
      this.mass = Math.random() * 3 + 0.005;
      this.radius = Math.pow(this.mass, 0.55);
      this.assumptions.push("Missing mass and radius");
    } else if (this.radius == null) {
      if (this.mass < 120 / 308) {
        // M-R relation for mass < ~120 earth masses.
        this.radius = Math.pow(this.mass, 0.55);
      } else {
        // M-R relation for mass > ~120 earth masses.
        this.radius = Math.pow(this.mass, 0.03);
      }
      this.assumptions.push("Missing radius");
    } else if (this.mass == null) {
      // M-R relation for mass < ~120 earth masses, as this is the most common
      // range of mass for exoplanets
      this.mass = Math.pow(this.radius, 1 / 0.55);
      this.assumptions.push("Missing mass");
    }
  }
}
