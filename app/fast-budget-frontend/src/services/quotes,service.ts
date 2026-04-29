import api from './api';
import { Quote } from '../types';

export const quotesService = {
  async getAll(): Promise<Quote[]> {
    const { data } = await api.get<Quote[]>('/api/quotes/');
    return data;
  },

  async getById(id: number): Promise<Quote> {
    const { data } = await api.get<Quote>(`/api/quotes/${id}`);
    return data;
  },

  async create(quote: Partial<Quote>): Promise<Quote> {
    const { data } = await api.post<Quote>('/api/quotes/', quote);
    return data;
  },

  async update(id: number, quote: Partial<Quote>): Promise<Quote> {
    const { data } = await api.put<Quote>(`/api/quotes/${id}`, quote);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/quotes/${id}`);
  }
};
