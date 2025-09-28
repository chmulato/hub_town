-- Seeds iniciais para o HUB de Entregas

-- Inserir marketplaces principais
INSERT INTO marketplaces (name, api_endpoint, api_key_required) VALUES
    ('Mercado Livre', 'https://api.mercadolibre.com', true),
    ('Shopee', 'https://partner.shopeemobile.com', true),
    ('Shein', 'https://api.shein.com', true),
    ('Amazon', 'https://mws.amazonservices.com', true),
    ('AliExpress', 'https://api.aliexpress.com', true);

-- Inserir alguns motoristas de exemplo
INSERT INTO drivers (name, contact, vehicle_type, license_plate, active) VALUES
    ('João Silva', '+55 11 99999-1111', 'Moto', 'ABC-1234', true),
    ('Maria Santos', '+55 11 99999-2222', 'Carro', 'DEF-5678', true),
    ('Pedro Costa', '+55 11 99999-3333', 'Moto', 'GHI-9012', true);

-- Criar alguns endereços de exemplo
INSERT INTO addresses (street, number, neighborhood, city, state, zip_code) VALUES
    ('Rua das Flores', '123', 'Centro', 'Cidade Pequena', 'SP', '12345-678'),
    ('Av. Principal', '456', 'Jardim América', 'Cidade Pequena', 'SP', '12345-000'),
    ('Rua do Comércio', '789', 'Vila Nova', 'Cidade Pequena', 'SP', '12346-123');

-- Criar alguns compradores de exemplo
INSERT INTO buyers (name, contact, email, address_id) VALUES
    ('Carlos Souza', '+55 11 98888-1111', 'carlos@email.com', 1),
    ('Ana Maria', '+55 11 98888-2222', 'ana@email.com', 2),
    ('Roberto Lima', '+55 11 98888-3333', 'roberto@email.com', 3);

-- Função para gerar hub_order_id único
CREATE OR REPLACE FUNCTION generate_hub_order_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'HUB' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(nextval('orders_id_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar hub_order_id automaticamente
CREATE OR REPLACE FUNCTION set_hub_order_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.hub_order_id IS NULL OR NEW.hub_order_id = '' THEN
        NEW.hub_order_id = generate_hub_order_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_hub_order_id
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_hub_order_id();

-- Trigger para registrar mudanças de status
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.order_status IS DISTINCT FROM NEW.order_status THEN
        INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by)
        VALUES (NEW.id, OLD.order_status, NEW.order_status, 'system');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_status_change();