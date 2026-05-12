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
}
