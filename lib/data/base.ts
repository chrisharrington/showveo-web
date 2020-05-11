import { ErrorCode, HttpError } from '@lib/errors';

export default class BaseService {
    async get(url: string, params?: any) : Promise<any> {
        const response = await fetch(`${url}${buildQuery(params)}`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include'
        });

        if (response.status === ErrorCode.InternalError)
            throw new HttpError(ErrorCode.InternalError, response.body ? response.body.toString() : '');
        if (response.status === ErrorCode.Unauthorized)
            throw new HttpError(ErrorCode.Unauthorized, 'Unauthorized.');

        return await response.json();
    }

    async post(url: string, params?: any, headers?: any) {
        headers = headers || {};
        headers['Content-Type'] = 'application/json';
        return fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: new Headers(headers),
            body: JSON.stringify(params),
            credentials: 'include'
        });
    }
}

function buildQuery(params: any) : string {
    var query = '';
    for (let name in params)
        query += `&${name}=${params[name] ? encodeURIComponent(params[name]) : ''}`;
    return query ? `?${query.substring(1)}` : query;
}