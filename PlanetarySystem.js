class PlanetarySystem {
  constructor(stars, planets, systems = null) {
    this.stars = stars;
    this.planets = planets;
    this.systems = systems;
    this.totalStarMass = getStarMass();
  }
  
  
  /**
   * Calculates the total mass of stars in the system.
   *
   * @returns {number} - the total mass of stars in the system.
   */
  getStarMass() {
    let totalStarMass = 0;

    for (const star in this.stars) {
      totalStarMass += star.stellarMass;
    }

    for (const system in this.systems) {
      totalStarMass += system.totalStarMass;
    }

    return totalStarMass;
  }
}
