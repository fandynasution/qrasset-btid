export interface DataItem {
    entity_cd: string;
    reg_id: string;
}

export interface QrCodeInsertData {
    entity_cd: string;
    reg_id: string;
    qr_url_attachment: string; // Path to the QR code PNG file
}
