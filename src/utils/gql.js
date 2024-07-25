function getGql(url) {
    return async (query, variables) => {
      let headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
  
      const token = localStorage.getItem("token");
  
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
  
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ query, variables }),
      });
  
      const data = await response.json();
  
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
  
      return data.data[Object.keys(data.data)[0]];
    };
  }

const gql = getGql('http://chat.ed.asmer.org.ua/graphql');

export default gql;