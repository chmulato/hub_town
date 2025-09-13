-- Schema do HUB de Entregas
-- Baseado no rascunho_db.txt

-- Tabela de marketplaces
CREATE TABLE marketplaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    api_endpoint VARCHAR(255),
    api_key_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de endereços (normalizada)
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes/compradores
CREATE TABLE buyers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(50),
    email VARCHAR(255),
    address_id INTEGER REFERENCES addresses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de motoristas/entregadores
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50),
    license_plate VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de rotas
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    route_code VARCHAR(50) NOT NULL UNIQUE,
    driver_id INTEGER REFERENCES drivers(id),
    route_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela principal de pedidos
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    hub_order_id VARCHAR(100) NOT NULL UNIQUE,
    marketplace_id INTEGER REFERENCES marketplaces(id) NOT NULL,
    original_order_id VARCHAR(255) NOT NULL,
    buyer_id INTEGER REFERENCES buyers(id) NOT NULL,
    
    -- Informações do produto
    product_name VARCHAR(500) NOT NULL,
    product_sku VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    package_weight DECIMAL(8,3), -- em kg
    package_dimensions VARCHAR(50), -- formato: "30x20x5cm"
    
    -- Status e logística
    order_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    tracking_code VARCHAR(100),
    assigned_driver_id INTEGER REFERENCES drivers(id),
    route_id INTEGER REFERENCES routes(id),
    
    -- Dados operacionais
    source_api VARCHAR(50),
    sync_status VARCHAR(50) DEFAULT 'pending',
    
    -- Auditoria e controle
    consent_given BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(marketplace_id, original_order_id)
);

-- Tabela de logs de acesso (auditoria LGPD)
CREATE TABLE access_logs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    user_identifier VARCHAR(255),
    action VARCHAR(100), -- 'view', 'update', 'delete', etc.
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico de status dos pedidos
CREATE TABLE order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_orders_hub_order_id ON orders(hub_order_id);
CREATE INDEX idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_marketplace ON orders(marketplace_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_access_logs_order_id ON access_logs(order_id);
CREATE INDEX idx_status_history_order_id ON order_status_history(order_id);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();