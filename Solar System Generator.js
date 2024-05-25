/**
 * Fetches data from the NASA Exoplanet Database.
 *
 * @async
 * @param {string} dataCols A string of database columns to query, separated by commas.
 * @param {string} dataTable The name of the data table to query.
 * @param {string} condition Return data only for entries where this condition is fulfilled.
 * @returns {json} Returns the specified database columns from the specified data table for entries that fulfil the specified condition.
 *
 * @example
 * const fetchNasaData("pl_name", "pscomppars", "hostname='55 Cnc'"); // Returns the names of planets with hostname='55 Cnc' from table pscomppars.
 */
const fetchNASAData = async (dataCols, dataTable, condition) => {
  const apiURL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=";

  let jsonData = await fetch(
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
      }
    )
    .then((jsonResponse) => {
      return jsonResponse;
    })
    .catch((errror) => {
      console.log(error);
    });

  return jsonData;
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
  console.log(starData);
};

function main() {
  let systemName = "55 Cnc";

  fetchSystemData(systemName);
}

main();
