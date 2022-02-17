const buildHeaders = () => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  return headers;
};

interface Query {
  query: string;
  variables: Record<string, string>;
}

export interface GraphQLError {
  code?: number;
  reason: string;
}

type HeaderProcessor = (headers: Headers) => Headers;
const id: HeaderProcessor = (headers) => headers;

/**
 * @param {string} serviceUrl - GraphQL service endpoint
 * @param {Query} query - GraphQL query
 * @param {HeaderProcessor} processHeaders - a function to add extra headers to the request
 */
export function graphqlQuery<D>(
  serviceUrl: string,
  query: Query,
  processHeaders: HeaderProcessor = id,
): Promise<D> {
  const headers = processHeaders(buildHeaders());

  return fetch(
    new Request(serviceUrl, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers,
      body: JSON.stringify(query),
    }),
  )
    .then((response) => {
      if (!response.ok) {
        return Promise.reject({
          code: response.status,
          reason: response.statusText,
        });
      }

      return response;
    })
    .then((response) => response.json())
    .then((json) => {
      if (json.errors) {
        return Promise.reject({
          reason: json.errors[0]?.category || 'default',
        });
      }

      return json.data;
    });
}
