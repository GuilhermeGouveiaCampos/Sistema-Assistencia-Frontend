import axios from 'axios';

export const buscarTecnicoMenosCarregado = async () => {
  const response = await axios.get('http://localhost:3001/api/tecnicos/menos-carregados');
  return response.data;
};
