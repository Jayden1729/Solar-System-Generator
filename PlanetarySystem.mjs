import { Star } from "./Star.mjs";
import { Planet } from "./Planet.mjs";

export class PlanetarySystem {
  constructor(stars, planets, subSystems = null) {
    this.stars = stars;
    this.planets = planets;
    this.subSystems = subSystems;
    this.totalStarMass = this.getStarMass();
    this.fixPeriodAndAxis();
  }

  /**
   * Calculates the total mass of stars in the system.
   *
   * @returns {number} - The total mass of stars in the system.
   */
  getStarMass() {
    let totalStarMass = 0;

    for (const star of this.stars) {
      totalStarMass += star.stellarMass;
    }

    if (this.subSystems) {
      for (const subSystem of this.subSystems) {
        totalStarMass += subSystem.totalStarMass;
      }
    }

    return totalStarMass;
  }
  /**
   * Fixes the period and semi-major axis for planets if either value is
   * missing, and adds strings to planet.assumptions detailing which values
   * are missing.
   *
   * If both are missing, the semi-major axis is set to between 0.1 and 0.15 au
   * as this is the most common range for exoplanets. This is used to calculate
   * the orbital period from the period-semimajor axis relation.
   *
   * If only one value is missing, hte period-semimajor axis relation is used
   * to calculate the missing value.
   */
  fixPeriodAndAxis() {
    const G = 6.67 * pow(10, -11);
    for (const planet of this.planets) {
      if (planet.orbitalPeriod === 0 && planet.semiMajorAxis === 0) {
        // If no recorded semi-major axis or orbital period, a semi-major axis
        // of between 0.1 and 0.16 au is used as this is the most common range
        // for exoplanets.
        planet.semiMajorAxis = Math.random() * 0.15 + 0.1;
        // prettier-ignore
        {
        // Orbital period is calculated from period-semimajor axis relation.
        planet.orbitalPeriod = Math.sqrt((4 * pow(Math.PI, 2) * 
          Math.pow(planet.semiMajorAxis, 3) * 1684) / (G * this.totalStarMass)) 
          / 86400
        }
        planet.assumptions.push("Missing semi-major axis and orbital period");
      } else if (planet.orbitalPeriod === 0) {
        // prettier-ignore
        {
        // Orbital period is calculated from period-semimajor axis relation.
        planet.orbitalPeriod = Math.sqrt((4 * pow(Math.PI, 2) * 
          Math.pow(planet.semiMajorAxis, 3) * 1684) / (G * this.totalStarMass)) 
          / 86400;
        }
        planet.assumptions.push("Missing semi-major axis");
      } else if (planet.semiMajorAxis === 0) {
        // prettier-ignore
        {
        // Semi-major axis is calculated from period-semimajor axis relation.
        planet.semiMajorAxis = 164 * Math.cbrt((G * this.totalStarMass * 
          Math.pow(planet.orbitalPeriod, 2)) / (4 * Math.pow(Math.PI, 2)));
        }
        planet.assumptions.push("Missing orbital period");
      }
    }
  }

  /**
   * Constructs a PlanetarySystem object from a list of stars and planets.
   * Organised so that planets orbiting a single star are contained in
   * sub PlanetarySystems in the final object, and lone stars with no orbiting
   * planets, and planets orbiting more than one star, are contained within the
   * stars and planets attributes of the final PlanetarySystem, respectively.
   *
   * @static
   * @param {Array.<Star>} stars - List of stars within the system.
   * @param {Array.<Planet>} planets - List of planets within the system.
   * @returns {PlanetarySystem} - A planetary system object.
   */
  static constructSystem(stars, planets) {
    let subSystems = [];
    let binaryPlanets = [];
    let loneStars = [];

    for (const star of stars) {
      let starPlanets = [];

      for (const planet of planets) {
        if (planet.hostName === star.hostName && planet.orbitBinary === 0) {
          starPlanets.push(planet);
        } else if (planet.orbitBinary) {
          binaryPlanets.push(planet);
        }
      }

      if (starPlanets.length) {
        subSystems.push(new PlanetarySystem([star], starPlanets));
      } else {
        loneStars.push(star);
      }
    }

    if (binaryPlanets.length || loneStars.length || subSystems.length > 0) {
      return new PlanetarySystem(loneStars, binaryPlanets, subSystems);
    } else {
      return subSystems[0];
    }
  }
}
