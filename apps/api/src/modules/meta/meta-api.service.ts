import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MetaApiService {
  private readonly graphUrl = 'https://graph.facebook.com/v22.0';

  getAuthUrl(workspaceId: string) {
    const clientId = process.env.META_APP_ID;
    const redirectUri = process.env.META_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new Error('Meta env vars missing');
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope:
        'whatsapp_business_management,whatsapp_business_messaging,business_management',
      response_type: 'code',
      state: workspaceId,
    });

    return `https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string) {
    const { data } = await axios.get(`${this.graphUrl}/oauth/access_token`, {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: process.env.META_REDIRECT_URI,
        code,
      },
    });

    return data.access_token as string;
  }

  async getBusinessId(accessToken: string) {
    const { data } = await axios.get(`${this.graphUrl}/me/businesses`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data.data[0].id as string;
  }

  async getWabaId(accessToken: string, businessId: string) {
    const { data } = await axios.get(
      `${this.graphUrl}/${businessId}/owned_whatsapp_business_accounts`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return data.data[0].id as string;
  }

  async getPhoneNumber(accessToken: string, wabaId: string) {
    const { data } = await axios.get(
      `${this.graphUrl}/${wabaId}/phone_numbers`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return data.data[0];
  }

  async createTemplate(data: {
    accessToken: string;
    wabaId: string;
    name: string;
    category: string;
    language: string;
    components: unknown;
  }) {
    const response = await axios.post(
      `${this.graphUrl}/${data.wabaId}/message_templates`,
      {
        name: data.name,
        category: data.category,
        language: data.language,
        components: data.components,
      },
      {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }

  async getTemplates(accessToken: string, wabaId: string) {
    const { data } = await axios.get(
      `${this.graphUrl}/${wabaId}/message_templates`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return data.data;
  }

  async deleteTemplate(params: {
    accessToken: string;
    wabaId: string;
    name: string;
  }) {
    await axios.delete(`${this.graphUrl}/${params.wabaId}/message_templates`, {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
      params: {
        name: params.name,
      },
    });

    return true;
  }

  async updateTemplate(params: {
    accessToken: string;
    wabaId: string;
    oldName: string;
    name: string;
    category: string;
    language: string;
    components: any;
  }) {
    await this.deleteTemplate({
      accessToken: params.accessToken,
      wabaId: params.wabaId,
      name: params.oldName,
    });

    return this.createTemplate({
      accessToken: params.accessToken,
      wabaId: params.wabaId,
      name: params.name,
      category: params.category,
      language: params.language,
      components: params.components,
    });
  }
}
