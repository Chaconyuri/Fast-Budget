import React, { useEffect, useState } from 'react';
import { FileText, Briefcase, Package, TrendingUp } from 'lucide-react';
import { quotesService } from '../services/quotes.service';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalQuotes: 0,
    approvedQuotes: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const quotes = await quotesService.getAll();
      setStats({
        totalQuotes: quotes.length,
        approvedQuotes: quotes.filter(q => q.status === 'approved').length,
        totalRevenue: quotes
          .filter(q => q.status === 'approved')
          .reduce((sum, q) => sum + q.total_amount, 0)
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const cards = [
    { icon: FileText, label: 'Total de Orçamentos', value: stats.totalQuotes, color: 'blue' },
    { icon: TrendingUp, label: 'Orçamentos Aprovados', value: stats.approvedQuotes, color: 'green' },
    { icon: Briefcase, label: 'Receita Total', value: `R$ ${stats.totalRevenue.toFixed(2)}`, color: 'purple' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <card.icon className={`w-12 h-12 text-${card.color}-500`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
