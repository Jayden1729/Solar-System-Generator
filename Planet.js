class Planet {
  constructor(data) {
    this.name = data["pl_name"];
    this.hostname = data["hostname"];
    this.orbitalPeriod = data["pl_orbper"];
    this.semiMajorAxis = data["pl_orbsmax"];
    this.planetRadius = data["pl_rade"];
    this.planetMass = getMass(data);
    this.planetDensity = data["pl_dens"];
    this.orbitalEccentricity = data["pl_orbeccen"];
    this.orbitalInclination = data["pl_orbincl"];
    this.ra = data["ra"];
    this.dec = data["dec"];
    this.orbitBinary = data["cb_flag"];
    this.numMoons = data["sy_mnum"];
  }

  getMass(data) {
    if (data["pl_masse"] != null) {
      return data["pl_masse"];
    } else if (data["pl_bmasse"] != null) {
      return data["pl_bmasse"];
    } else {
      return data["pl_msinie"];
    }
  }
}
