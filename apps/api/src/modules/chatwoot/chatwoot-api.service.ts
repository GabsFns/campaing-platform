import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChatwootApiService {
  async getProfile(baseUrl: string, apiToken: string) {
    const { data } = await axios.get(`${baseUrl}/api/v1/profile`, {
      headers: {
        api_access_token: apiToken,
      },
    });

    return data;
  }

  async getAgents(baseUrl: string, apiToken: string, accountId: number) {
    const { data } = await axios.get(
      `${baseUrl}/api/v1/accounts/${accountId}/agents`,
      {
        headers: {
          api_access_token: apiToken,
        },
      },
    );

    return data;
  }

  async createAgent(params: {
    baseUrl: string;
    apiToken: string;
    accountId: number;

    name: string;
    email: string;
  }) {
    const response = await axios.post(
      `${params.baseUrl}/api/v1/accounts/${params.accountId}/agents`,
      {
        name: params.name,
        email: params.email,

        role: 'agent',

        availability_status: 'available',

        auto_offline: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          api_access_token: params.apiToken,
        },
      },
    );

    return response.data;
  }
}
