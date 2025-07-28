import React from 'react';
import { Space } from 'antd';
import RequestForm from './RequestForm';
import ResponseView from './ResponseView';

import useHttpClient from './useHttpClient';
import { HttpRequest } from './httpTypes';


const App: React.FC = () => {
  const { response, loading, error, sendRequest } = useHttpClient();

  const handleSubmit = (values: any) => {
    const request: HttpRequest = {
      url: values.url,
      method: values.method,
      params: values.params || [],
      headers: values.headers || [],
      cookies: values.cookies || [],
      body: values.body,
      proxy: values.proxy,
      useTauri: values.useTauri,
    };

    sendRequest(request);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <RequestForm onSubmit={handleSubmit} loading={loading} />
      <ResponseView response={response} loading={loading} error={error} />
    </Space>
  );
};

export default App;