import React, { useState, useEffect } from 'react';
import './CurrencyWidget.css';

interface CurrencyRate {
  currency: string;
  rate: number;
  lastUpdate: string;
}

interface CurrencyWidgetProps {
  currencies: string[];
  refreshInterval: number;
  showTimestamp: boolean;
  apiEndpoint: string;
  className?: string;
  onTimestampUpdate?: (timestamp: string) => void;
}

const CurrencyWidget: React.FC<CurrencyWidgetProps> = ({
  currencies = ['USD', 'EUR'],
  refreshInterval = 900000, // 15 хвилин
  showTimestamp = true,
  apiEndpoint = '/api/currency',
  className = '',
  onTimestampUpdate
}) => {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [btcCurrency, setBtcCurrency] = useState<'UAH' | 'USD'>('USD');

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch currency rates');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const filteredRates = Object.entries(data.data)
          .filter(([currency]) => currencies.includes(currency))
          .map(([currency, rateData]: [string, any]) => ({
            currency,
            rate: rateData.rate,
            lastUpdate: rateData.lastUpdate
          }));
        
        setRates(filteredRates);
        if (showTimestamp && filteredRates.length > 0 && onTimestampUpdate) {
          onTimestampUpdate(filteredRates[0].lastUpdate);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    
    const interval = setInterval(fetchRates, refreshInterval);
    return () => clearInterval(interval);
  }, [currencies, refreshInterval, apiEndpoint]);

  const formatRate = (rate: number, currency?: string) => {
    if (currency === 'BTC') {
      // For Bitcoin, show in selected currency
      const usdRate = rates.find(r => r.currency === 'USD')?.rate || 41;
      const btcInSelectedCurrency = btcCurrency === 'USD' ? rate / usdRate : rate;
      return btcInSelectedCurrency.toLocaleString('uk-UA', { maximumFractionDigits: 2 });
    }
    return rate.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleBtcCurrency = () => {
    setBtcCurrency(prev => prev === 'UAH' ? 'USD' : 'UAH');
  };

  if (loading && rates.length === 0) {
    return (
      <div className={`currency-widget ${className}`}>
        <div className="currency-widget__loading">
          <div className="spinner"></div>
          <span>Завантаження курсів...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`currency-widget ${className}`}>
        <div className="currency-widget__error">
          <span>Помилка завантаження курсів</span>
          <button onClick={fetchRates} className="retry-button">
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`currency-widget ${className}`}>
      <div className="currency-widget__rates">
        {rates.map((rate) => (
          <div key={rate.currency} className="currency-rate">
            <div className="currency-rate__info">
              <div className="currency-rate__currency">
                {rate.currency}
              </div>
              <div className="currency-rate__rate">
                {formatRate(rate.rate, rate.currency)} {rate.currency === 'BTC' ? (
                  <>
                    {btcCurrency === 'UAH' ? '₴' : '$'}
                    <button 
                      onClick={toggleBtcCurrency} 
                      className="currency-toggle"
                      title={`Переключити на ${btcCurrency === 'UAH' ? 'USD' : 'UAH'}`}
                    >
                      {btcCurrency === 'UAH' ? 'UAH' : 'USD'} ⇄
                    </button>
                  </>
                ) : '₴'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrencyWidget;