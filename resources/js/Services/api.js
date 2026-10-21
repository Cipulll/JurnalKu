class ApiError extends Error {
    constructor(message, status, errors = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

async function request(path, { method = 'GET', body } = {}) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    const headers = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
    }
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(path, {
        method,
        credentials: 'same-origin',
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
        ? await response.json()
        : { message: await response.text() };

    if (!response.ok) {
        throw new ApiError(
            payload.message || `Permintaan gagal (${response.status}).`,
            response.status,
            payload.errors || {}
        );
    }

    if (!contentType.includes('application/json')) {
        throw new ApiError('Server mengirim respons yang tidak dikenali.', response.status);
    }

    return payload;
}

function updateCsrfToken(response) {
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfMeta && response.csrfToken) csrfMeta.content = response.csrfToken;
}

export const api = {
    request,
    bootstrap: () => request('/api/bootstrap'),
    login: async (credentials) => {
        const response = await request('/auth/login', { method: 'POST', body: credentials });
        updateCsrfToken(response);
        return response;
    },
    register: async (details) => {
        const response = await request('/auth/register', { method: 'POST', body: details });
        updateCsrfToken(response);
        return response;
    },
    logout: async () => {
        const response = await request('/auth/logout', { method: 'POST', body: {} });
        updateCsrfToken(response);
        return response;
    },
    createTask: (task) => request('/api/tasks', { method: 'POST', body: task }),
    updateTask: (id, task) => request(`/api/tasks/${id}`, { method: 'PATCH', body: task }),
    deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
    createTransaction: (transaction) => request('/api/transactions', { method: 'POST', body: transaction }),
    deleteTransaction: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
    createNote: (note) => request('/api/notes', { method: 'POST', body: note }),
    deleteNote: (id) => request(`/api/notes/${id}`, { method: 'DELETE' }),
};
