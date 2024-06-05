class PlanetarySystem {
  constructor(stars, planets, subSystems = null) {
    this.stars = stars;
    this.planets = planets;
    this.subSystems = subSystems;
    this.totalStarMass = getStarMass();
  }

  /**
   * Calculates the total mass of stars in the system.
   *
   * @returns {number} - The total mass of stars in the system.
   */
  getStarMass() {
    let totalStarMass = 0;

    for (const star in this.stars) {
      totalStarMass += star.stellarMass;
    }

    for (const subSystem in this.subSystems) {
      totalStarMass += subSystem.totalStarMass;
    }

    return totalStarMass;
  }

  /**
   * Constructs a PlanetarySystem object from a list of stars and planets.
   * Organised so that planets orbiting a single star are contained in
   * sub PlanetarySystems in the final object, and lone stars with no orbiting
   * planets, and planets orbiting more than one star, are contained within the
   * stars and planets attributes of the final PlanetarySystem, respectively.
   *
   * @static
   * @param {*} stars - List of stars within the system.
   * @param {*} planets - List of planets within the system.
   * @returns {PlanetarySystem} - A planetary system object.
   */
  static constructSystem(stars, planets) {
    let subSystems = [];
    let binaryPlanets = [];
    let loneStars = [];

    for (const star in stars) {
      let starPlanets = [];

      for (const planet in planets) {
        if (planet.hostName === star.hostName && !planet.orbitBinary) {
          starPlanets.push(planet);
        } else if (planet.orbitBinary) {
          binaryPlanets.push(planet);
        }
      }

      if (starPlanets.length) {
        subSystems.push(new PlanetarySystem(star, starPlanets));
      } else {
        loneStars.push(star);
      }
    }

    return new PlanetarySystem(loneStars, binaryPlanets, subSystems);
  }
}
