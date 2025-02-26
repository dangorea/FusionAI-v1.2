import type { AxiosResponse } from 'axios';
import RestApiService, { QueryParams } from '../../services/api';

const apiService = new RestApiService(window.env.BASE_URL);

class _OrganizationApiService {
  public getAllOrganizations(
    token: string,
    queryParams?: QueryParams,
  ): Promise<AxiosResponse<unknown>> {
    return apiService.get<unknown>(
      `/orgs`,
      queryParams,
      apiService.getAuthenticateHeader(token),
    );
  }
}

export const OrganizationApiEndpoint = new _OrganizationApiService();
