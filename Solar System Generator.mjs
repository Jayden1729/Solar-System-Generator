import { Planet } from "./Planet.mjs";
import { Star } from "./Star.mjs";
import { PlanetarySystem } from "./PlanetarySystem.mjs";

/**
 * Fetches data from the NASA Exoplanet Database.
 *
 * @async
 * @param {string} dataCols - A string of database columns to query, separated
 *   by commas.
 * @param {string} dataTable - The name of the data table to query.
 * @param {string} condition - Return data only for entries where this condition
 *   is fulfilled.
 * @returns {json} - Returns the specified database columns from the specified
 *   data table for entries that fulfil the specified condition, or returns an
 *   error.
 *
 * @example
 * const fetchNASAData("pl_name", "pscomppars", "hostname='55 Cnc'"); // Returns
 *   the names of planets with hostname='55 Cnc' from table pscomppars.
 */
const fetchNASAData = async (dataCols, dataTable, condition) => {
  const apiURL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=";

  const jsonData = await fetch(
    `${apiURL}select+${dataCols}+from+${dataTable}+where+${condition}&format=json`
  )
    .then(
      (response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Request failed!");
      },
      (networkError) => {
        console.log(networkError.message);
        return error;
      }
    )
    .then((jsonResponse) => {
      return jsonResponse;
    })
    .catch((error) => {
      console.log(error);
      return error;
    });

  return jsonData;
};

/**
 * Takes an array of objects, where many objects share the same identifier, and
 *   returns a list of objects with unique identifiers, where each attribute
 *   stores an array of all the attributes of that type of objects with
 *   corresponding identifiers in the original array.
 *
 * @param {Array.<Object>} objectData - An array of objects.
 * @param {string} identifier - The key corresponding to the identifier for each
 *    object.
 * @returns {Array.<Object>} - An array of objects, where each object has a
 *    unique identifier, and its attributes are arrays.
 */
const getObjectLists = (objectData, identifier) => {
  let dataLists = [];
  let storedObjectNames = [];

  for (const object of objectData) {
    const objectName = object[identifier];
    const keys = Object.keys(object);
    let isNew = true;

    storedObjectNames.forEach((element) => {
      if (objectName === element) {
        isNew = false;
      }
    });

    if (isNew) {
      const newObject = {};

      keys.forEach((element) => {
        newObject[element] = [object[element]];
      });

      dataLists.push(newObject);
      storedObjectNames.push(objectName);
    } else {
      for (const objectList of dataLists) {
        const objectListName = objectList[identifier][0];

        if (objectName === objectListName) {
          keys.forEach((element) => {
            objectList[element].push(object[element]);
          });
        }
      }
    }
  }
  return dataLists;
};

/**
 * Returns the median value of an array.
 *
 * @param {Array.<number>} array - An array of numbers.
 * @returns {number} - The median value.
 */
const getMedian = (array) => {
  array.sort((a, b) => {
    return a - b;
  });
  const centreIndex = (array.length - 1) / 2;
  const median =
    (array[Math.floor(centreIndex)] + array[Math.ceil(centreIndex)]) / 2;
  return median;
};

/**
 * Returns the mode of an array.
 *
 * @param {Array} array - An array.
 * @returns {*} - The mode of the array.
 */
const getMode = (array) => {
  let counts = {};
  for (const element of array) {
    if (counts[element] === undefined) {
      counts[element] = 1;
    } else {
      counts[element] += 1;
    }
  }

  let highestCount = 0;
  let mode;
  const keys = Object.keys(counts);
  for (const key of keys) {
    const keyValue = counts[key];
    if (keyValue > highestCount) {
      highestCount = keyValue;
      mode = key;
    }
  }
  return mode;
};

/**
 * Takes data aquired from NASA Exoplanet Database and simplifies it, so that
 *   each object only has one entry.
 *
 * @param {Array.<Object>} astroData - An array of astronomical objects aquired
 *   from the NASA Exoplanet Database.
 * @returns {Array.<Object>} - An array of astronomical objects, reduced so that
 *   each object only has one entry. The median value from all entries is taken
 *   for numerical attribute values, and the mode is taken for string attribute
 *   values.
 */
const simplifyAstroData = (astroData, identifier) => {
  const astroLists = getObjectLists(astroData, identifier);
  const reducedData = [];

  for (const astro of astroLists) {
    const keys = Object.keys(astro);
    for (const key of keys) {
      const filteredArray = astro[key].filter((element) => {
        return element != null;
      });
      astro[key] = filteredArray;
      const listType = typeof filteredArray[0];
      if (listType == "number") {
        astro[key] = getMedian(astro[key]);
      } else if (listType == "string") {
        astro[key] = getMode(astro[key]);
      } else {
        astro[key] = null;
      }
    }
    reducedData.push(astro);
  }
  return reducedData;
};

/**
 * Gets star and planet data for a given system.
 *
 * @async
 * @param {string} systemName - The name of the system.
 * @returns {Array.Array.<Object>} - An array of two arrays. The first array
 *   contains the data for all star objects. The second array contains the data
 *   for all planet objects in the system.
 */
const fetchSystemData = async (systemName) => {
  const planetDataCols =
    "pl_name,hostname,pl_orbper,pl_orbsmax,pl_radj,pl_bmassj,pl_dens,pl_orbeccen,pl_orbincl,ra,dec,cb_flag,sy_mnum";

  const starDataCols = "sy_name,hostname,st_rad,st_mass,st_dens,ra,dec,sy_dist";

  //Fetch data for stars in system
  const rawStarData = await fetchNASAData(
    starDataCols,
    "stellarhosts",
    `sy_name='${systemName}'`
  );

  //Simplify star data
  let starData;
  try {
    starData = simplifyAstroData(rawStarData, "hostname");
  } catch (error) {
    return error;
  }

  //Get planet data for all stars in system
  let planetData = [];
  for (const star of starData) {
    const rawPlanetData = await fetchNASAData(
      planetDataCols,
      "pscomppars",
      `hostname='${star["hostname"]}'`
    );
    try {
      const reducedPlanetData = simplifyAstroData(rawPlanetData, "pl_name");
      planetData = planetData.concat(reducedPlanetData);
    } catch (error) {
      console.log(error);
    }
  }

  return [starData, planetData];
};



/**
 * Creates PlanetarySystem object from raw star and planet data.
 *
 * @param {Array.<Object>} starData - An array of objects holding star data.
 * @param {Array.<Object>} planetData - An array of objects holding planet data.
 * @returns {PlanetarySystem} - A PlanetarySystem object constructed from given
 *   star and planet data.
 */
const createSystem = (starData, planetData) => {
  let stars = [];
  let planets = [];

  for (const star of starData) {
    stars.push(new Star(star));
  }

  for (const planet of planetData) {
    planets.push(new Planet(planet));
  }

  return PlanetarySystem.constructSystem(stars, planets);
};

const main = async () => {
  let systemName = "55 Cnc";
  systemName = "Kepler-47";
  //systemName = "Kepler-97";

  const [starData, planetData] = await fetchSystemData(systemName);

  const planetarySystem = createSystem(starData, planetData);

  //console.log(systemData)
  console.log(planetarySystem);
};

main();
