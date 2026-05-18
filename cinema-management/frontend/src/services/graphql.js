import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8080/graphql'
});

export async function gqlRequest(query, variables = {}, auth = true) {
  const token = localStorage.getItem('managerToken');
  const headers = auth && token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await client.post('', { query, variables }, { headers });
  if (data.errors?.length) {
    throw new Error(data.errors.map((e) => e.message).join(', '));
  }
  return data.data;
}

