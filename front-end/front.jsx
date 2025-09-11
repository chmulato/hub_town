import { useEffect, useState } from "react";

export default function HubCD() {
  const [shopeeOrders, setShopeeOrders] = useState([]);
  const [mlOrders, setMlOrders] = useState([]);
  const [sheinOrders, setSheinOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, shipped: 0, pending: 0 });
  
  // Estados para paginação
  const [shopeePagination, setShopeePagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [mlPagination, setMlPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [sheinPagination, setSheinPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [itemsPerPage] = useState(5);
  
  // Estados para busca unificada
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPagination, setSearchPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [isSearching, setIsSearching] = useState(false);

  const fetchOrders = async (shopeePage = 1, mlPage = 1, sheinPage = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const [shopeeRes, mlRes, sheinRes] = await Promise.all([
        fetch(`http://localhost:3001/api/shopee/orders?page=${shopeePage}&limit=${itemsPerPage}`),
        fetch(`http://localhost:3001/api/ml/orders?page=${mlPage}&limit=${itemsPerPage}`),
        fetch(`http://localhost:3001/api/shein/orders?page=${sheinPage}&limit=${itemsPerPage}`)
      ]);

      if (!shopeeRes.ok || !mlRes.ok || !sheinRes.ok) {
        throw new Error('Erro ao conectar com a API');
      }

      const shopeeResponse = await shopeeRes.json();
      const mlResponse = await mlRes.json();
      const sheinResponse = await sheinRes.json();
      
      setShopeeOrders(shopeeResponse.data);
      setMlOrders(mlResponse.data);
      setSheinOrders(sheinResponse.data);
      
      // Atualizar informações de paginação
      setShopeePagination({
        currentPage: shopeeResponse.currentPage,
        totalPages: shopeeResponse.totalPages,
        total: shopeeResponse.total
      });
      
      setMlPagination({
        currentPage: mlResponse.currentPage,
        totalPages: mlResponse.totalPages,
        total: mlResponse.total
      });
      
      setSheinPagination({
        currentPage: sheinResponse.currentPage,
        totalPages: sheinResponse.totalPages,
        total: sheinResponse.total
      });
      
      // Calcular estatísticas baseadas no total de todos os dados
      const totalOrders = shopeeResponse.total + mlResponse.total + sheinResponse.total;
      const totalShipped = Math.floor(totalOrders * 0.4); // Estimativa
      const totalPending = totalOrders - totalShipped;
      
      setStats({
        total: totalOrders,
        shipped: totalShipped,
        pending: totalPending
      });
      
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funções de navegação de páginas
  const handleShopeePageChange = (newPage) => {
    fetchOrders(newPage, mlPagination.currentPage, sheinPagination.currentPage);
  };

  const handleMlPageChange = (newPage) => {
    fetchOrders(shopeePagination.currentPage, newPage, sheinPagination.currentPage);
  };

  const handleSheinPageChange = (newPage) => {
    fetchOrders(shopeePagination.currentPage, mlPagination.currentPage, newPage);
  };

  // Função de busca unificada
  const performSearch = async (searchTerm, page = 1) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      fetchOrders();
      return;
    }

    setLoading(true);
    setError(null);
    setIsSearching(true);

    try {
      const response = await fetch(`http://localhost:3001/api/orders/search?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }

      const searchResponse = await response.json();
      
      setSearchResults(searchResponse.data);
      setSearchPagination({
        currentPage: searchResponse.currentPage,
        totalPages: searchResponse.totalPages,
        total: searchResponse.total
      });

    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a mudança do termo de busca
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      performSearch(value);
    } else {
      setIsSearching(false);
      fetchOrders();
    }
  };

  // Função para navegação na busca
  const handleSearchPageChange = (newPage) => {
    performSearch(searchTerm, newPage);
  };

  // Componente de paginação
  const PaginationComponent = ({ pagination, onPageChange, label }) => (
    <div className="flex items-center justify-between mt-4 px-4 py-2 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">
        {label}: {pagination.total} itens | Página {pagination.currentPage} de {pagination.totalPages}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          Anterior
        </button>
        
        {/* Números das páginas */}
        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 text-sm rounded ${
                pageNum === pagination.currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          Próxima
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'SHIPPED': return 'text-blue-600 bg-blue-100';
      case 'READY_TO_SHIP': return 'text-orange-600 bg-orange-100';
      case 'WAITING_PICKUP': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'DELIVERED': 'Entregue',
      'SHIPPED': 'Enviado',
      'READY_TO_SHIP': 'Pronto para Envio',
      'WAITING_PICKUP': 'Aguardando Coleta'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-600 text-5xl mb-4 font-bold">[ERROR]</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Hub Central de Pedidos</h1>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-auto lg:mx-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar pedidos em todos os marketplaces..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-400">[Search]</span>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <span>✕</span>
                  </button>
                )}
              </div>
              {isSearching && (
                <p className="text-xs text-blue-600 mt-1 ml-2">
                  Buscando em Shopee e Mercado Livre...
                </p>
              )}
            </div>
            
            <button 
              onClick={() => {
                setSearchTerm('');
                setIsSearching(false);
                fetchOrders();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviados/Entregues</p>
                <p className="text-3xl font-bold text-green-600">{stats.shipped}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="mb-8">
            <div className="bg-white shadow-sm rounded-xl border">
              <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-blue-600">[SEARCH]</span>
                  <h2 className="text-xl font-bold">Resultados da Busca: "{searchTerm}"</h2>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                    {searchPagination.total} encontrados
                  </span>
                </div>
              </div>
              <div className="p-6">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl block mb-2 text-gray-400">[NOT FOUND]</div>
                    Nenhum pedido encontrado para "{searchTerm}"
                    <p className="text-sm mt-2">Tente buscar por código do pedido, nome do cliente, produto ou endereço</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((order) => (
                      <div key={`${order.marketplace}-${order.orderId}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-800">{order.product}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                order.marketplace === 'shopee' 
                                  ? 'bg-orange-100 text-orange-600'
                                  : order.marketplace === 'mercadolivre'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-purple-100 text-purple-600'
                              }`}>
                                {order.marketplace === 'shopee' 
                                  ? 'Shopee' 
                                  : order.marketplace === 'mercadolivre'
                                  ? 'Mercado Livre'
                                  : 'Shein'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">#{order.orderId}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm"><span className="font-medium">Cliente:</span> {order.buyer}</p>
                          <p className="text-sm"><span className="font-medium">Endereço:</span> {order.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Paginação da Busca */}
                {searchResults.length > 0 && (
                  <PaginationComponent 
                    pagination={searchPagination} 
                    onPageChange={handleSearchPageChange}
                    label="Resultados"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        <div className={`grid gap-6 lg:grid-cols-3 ${isSearching ? 'opacity-50' : ''}`}>
          {/* Shopee Orders */}
          <div className="bg-white shadow-sm rounded-xl border">
            <div className="p-6 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-orange-600">SHOP</span>
                <h2 className="text-xl font-bold">Pedidos Shopee</h2>
                <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                  {shopeeOrders.length}
                </span>
              </div>
            </div>
            <div className="p-6">
              {shopeeOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl block mb-2 text-gray-400">[-]</div>
                  Nenhum pedido encontrado
                </div>
              ) : (
                <div className="space-y-4">
                  {shopeeOrders.map((order) => (
                    <div key={order.orderId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{order.product}</h3>
                          <p className="text-sm text-gray-600">#{order.orderId}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Cliente:</span> {order.buyer}</p>
                        <p className="text-sm"><span className="font-medium">Endereço:</span> {order.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Paginação Shopee */}
              <PaginationComponent 
                pagination={shopeePagination} 
                onPageChange={handleShopeePageChange}
                label="Shopee"
              />
            </div>
          </div>

          {/* Mercado Livre Orders */}
          <div className="bg-white shadow-sm rounded-xl border">
            <div className="p-6 border-b bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-yellow-600">STORE</span>
                <h2 className="text-xl font-bold">Pedidos Mercado Livre</h2>
                <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                  {mlOrders.length}
                </span>
              </div>
            </div>
            <div className="p-6">
              {mlOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl block mb-2 text-gray-400">[-]</div>
                  Nenhum pedido encontrado
                </div>
              ) : (
                <div className="space-y-4">
                  {mlOrders.map((order) => (
                    <div key={order.orderId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{order.product}</h3>
                          <p className="text-sm text-gray-600">#{order.orderId}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Cliente:</span> {order.buyer}</p>
                        <p className="text-sm"><span className="font-medium">Endereço:</span> {order.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Paginação Mercado Livre */}
              <PaginationComponent 
                pagination={mlPagination} 
                onPageChange={handleMlPageChange}
                label="Mercado Livre"
              />
            </div>
          </div>

          {/* Shein Orders */}
          <div className="bg-white shadow-sm rounded-xl border">
            <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-purple-600">FASHION</span>
                <h2 className="text-xl font-bold">Pedidos Shein</h2>
                <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                  {sheinOrders.length}
                </span>
              </div>
            </div>
            <div className="p-6">
              {sheinOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl block mb-2 text-gray-400">[-]</div>
                  Nenhum pedido encontrado
                </div>
              ) : (
                <div className="space-y-4">
                  {sheinOrders.map((order) => (
                    <div key={order.orderId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{order.product}</h3>
                          <p className="text-sm text-gray-600">#{order.orderId}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Cliente:</span> {order.buyer}</p>
                        <p className="text-sm"><span className="font-medium">Endereço:</span> {order.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Paginação Shein */}
              <PaginationComponent 
                pagination={sheinPagination} 
                onPageChange={handleSheinPageChange}
                label="Shein"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
