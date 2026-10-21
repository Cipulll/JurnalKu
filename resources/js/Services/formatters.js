export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

export const formatDate = (value, options = { dateStyle: 'long' }) =>
    new Intl.DateTimeFormat('id-ID', options).format(new Date(value));
