/**
 * Fetches data from the NASA Exoplanet Database.
 *
 * @async
 * @param {string} dataCols A string of database columns to query, separated by
 *   commas.
 * @param {string} dataTable The name of the data table to query.
 * @param {string} condition Return data only for entries where this condition
 *   is fulfilled.
 * @returns {json} Returns the specified database columns from the specified
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
    isNew = true;

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
 * @param {Array} array - An array of numbers.
 * @returns {number} - The median value.
 */
const getMedian = (array) => {
  array.sort((a, b) => {
    return a - b;
  });
  centreIndex = (array.length - 1) / 2;
  median = (array[Math.floor(centreIndex)] + array[Math.ceil(centreIndex)]) / 2;
  return median;
};

const fetchSystemData = async (systemName) => {
  const planetDataCols =
    "pl_name,hostname,pl_orbper,pl_orbsmax,pl_rade,pl_masse,pl_msinie,pl_bmasse,pl_dens,pl_orbeccen,pl_orbincl,ra,dec,cb_flab,sy_mnum";

  const starDataCols = "sy_name,hostname,st_rad,st_mass,st_dens,ra,dec,sy_dist";

  //Fetch data for stars in system
  const starData = await fetchNASAData(
    starDataCols,
    "stellarhosts",
    `sy_name='${systemName}'`
  );

  try {
    const condensedData = getObjectLists(starData, "hostname");
    console.log(condensedData);
  } catch (error) {
    console.log(error);
  }
};

function main() {
  let systemName = "55 Cnc";

  fetchSystemData(systemName);
}

main();
