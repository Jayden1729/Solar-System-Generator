class Planet {
  constructor(data) {
    this.name = data["pl_name"];
    this.hostname = data["hostname"];
    this.orbitalPeriod = data["pl_orbper"];
    this.semiMajorAxis = data["pl_orbsmax"];
    this.planetRadius = data["pl_rade"];
    this.planetMass = data["pl_bmasse"]
    this.planetDensity = data["pl_dens"];
    this.orbitalEccentricity = data["pl_orbeccen"];
    this.orbitalInclination = data["pl_orbincl"];
    this.ra = data["ra"];
    this.dec = data["dec"];
    this.orbitBinary = data["cb_flag"];
    this.numMoons = data["sy_mnum"];
  }
}
