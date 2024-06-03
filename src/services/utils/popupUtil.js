export const windowOpen = (paramUrl = "", key = "", featureObject = null) => {
  let url = `#/${paramUrl}`;
  const name = "_blank";
  let features = "";

  if (featureObject) {
    Object.keys(featureObject).forEach(key => {
      features += `${features ? "," : ""}${key}=${featureObject[key]}`;
    });
  }

  if (key) {
    url += `?key=${key}`;
  }

  window.open(url, name, features);
};
