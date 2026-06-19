import MockAdapter from 'axios-mock-adapter';
import Axios from 'axios';

// This adapter intercepts global Axios calls only.
// All API mocks are now handled via RTK Query queryFn in each *Api.js file,
// because the app uses a separate axiosInstance that this adapter does not intercept.
const mock = new MockAdapter(Axios, { delayResponse: 300 });

export default mock;
