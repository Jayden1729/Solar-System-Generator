import { Star } from "./Star.mjs";
import { Planet } from "./Planet.mjs";
import * as THREE from "./node_modules/three/src/Three.js";

export class PlanetarySystem {
  constructor(stars, planets, subSystems = null) {
    this.stars = stars;
    this.planets = planets;
    this.subSystems = subSystems;
    this.totalStarMass = this.getStarMass();
    this.fixPeriodAndAxis();
    this.getPlanetOrbits();
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
    const G = 6.67 * Math.pow(10, -11);
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
   * Generates ellipses in the shape of each planet's orbit. Initially tries
   * using semi-major and semi-minor axes. If there are none recorded, a
   * circular orbit is assumed, with radius calculated from Kepler's Law.
   * Failing that, a random radius is used.
   */
  getPlanetOrbits() {
    const G = 6.67 * Math.pow(10, -11);
    for (const planet of this.planets) {
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      let curve;

      if (planet.semiMajorAxis != null && planet.orbitalEccentricity != null) {
        // prettier-ignore
        curve = new THREE.EllipseCurve(
          0, 0,
          planet.semiMajorAxis, planet.semiMinorAxis,
          0, 2 * Math.PI,
          false,
          0
        );
      } else if (planet.orbitalPeriod != null) {
        // prettier-ignore
        const orbitalRadius = 48.25 * Math.pow(
          (Math.pow(planet.orbitalPeriod, 2) * G * this.totalStarMass),
          1 / 3);
        // prettier-ignore
        curve = new THREE.EllipseCurve(
          0, 0,
          orbitalRadius, orbitalRadius,
          0, 2 * Math.PI,
          false,
          0
        );
        planet.assumptions.push("Assumed circular orbit");
      } else {
        // prettier-ignore
        curve = new THREE.EllipseCurve(
          0, 0,
          this.totalStarMass, this.totalStarMass,
          0, 2 * Math.PI,
          false,
          0
        );
        planet.assumptions.push("Assumed circular orbit with random radius");
      }

      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const ellipse = new THREE.Line(geometry, material);
      planet.orbitEllipse = ellipse;
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
        } else if (planet.hostName === star.hostName && planet.orbitBinary) {
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
