/*
  ====================================================================================
  Nama Aplikasi : Sistem e - SPPD Terpadu - Dinas Pendidikan, Kepemudaan dan Olahraga
  Hosting       : GitHub Pages (Murni Single Page Application / SPA)
  Backend / DB  : Supabase REST API & Dexie IndexedDB (Offline-First)
  Nama Halaman  : js/db.js
  Fungsi Halaman: Manajemen Database Lokal (Dexie.js) & Sinkronisasi Supabase
  ====================================================================================
*/

const SUPABASE_URL = 'https://offeebouiohweqlgyccx.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;
if (window.supabase) {
    // supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Inisialisasi Dexie Database Lokal
const db = new Dexie('SPPD_PKO_DB');
db.version(1).stores({
    master_pelaksana: 'nip, nama, pangkat, jabatan',
    master_sk: 'kode, nama, quota',
    sppd_records: 'id, noSuratTugas, noSPPD, kodeSK, namaPelaksana, createdAt'
});

window.AppDB = {
    async getMasterAsn() {
        try {
            let list = await db.master_pelaksana.toArray();
            if (list.length === 0) {
                list = [
                    { nip: '196801011988031012', nama: 'NAMA KEPALA DINAS, S.Pd., M.Si.', pangkat: 'Pembina Utama Muda / IV.c', jabatan: 'Kepala Dinas Pendidikan Kepemudaan dan Olahraga' },
                    { nip: '197501012000031002', nama: 'NAMA SEKRETARIS, S.IP', pangkat: 'Pembina / IV.a', jabatan: 'Sekretaris Dinas' },
                    { nip: '198202022005022004', nama: 'NAMA KABID, S.AP', pangkat: 'Penata Tingkat I / III.d', jabatan: 'Kepala Bidang Pembinaan Ketenagaan' }
                ];
                await db.master_pelaksana.bulkPut(list);
            }
            return list;
        } catch (err) {
            console.error("Error getMasterAsn:", err);
            return [];
        }
    },

    async saveMasterAsn(asn) {
        await db.master_pelaksana.put(asn);
        try {
            if (window.supabaseClient) {
                await supabaseClient.from('master_pelaksana').upsert([asn]);
            }
        } catch (e) { console.warn("Sync Supabase offline:", e); }
    },

    async bulkSaveMasterAsn(list) {
        await db.master_pelaksana.bulkPut(list);
        try {
            if (window.supabaseClient) {
                await supabaseClient.from('master_pelaksana').upsert(list);
            }
        } catch (e) { console.warn("Sync Supabase offline:", e); }
    },

    async deleteMasterAsn(nip) {
        await db.master_pelaksana.delete(nip);
        try {
            if (window.supabaseClient) {
                await supabaseClient.from('master_pelaksana').delete().eq('nip', nip);
            }
        } catch (e) { console.warn("Sync Supabase offline:", e); }
    },

    async getMasterSK() {
        try {
            let list = await db.master_sk.toArray();
            if (list.length === 0) {
                list = [
                    { kode: '01.02.03.2.01.0001', nama: 'Penyusunan Program dan Anggaran Dinas PKO', quota: 50 },
                    { kode: '01.02.03.2.02.0004', nama: 'Pembinaan Pendidik dan Tenaga Kependidikan', quota: 75 }
                ];
                await db.master_sk.bulkPut(list);
            }
            return list;
        } catch (err) {
            console.error("Error getMasterSK:", err);
            return [];
        }
    },

    async saveMasterSK(sk) {
        await db.master_sk.put(sk);
    },

    async deleteMasterSK(kode) {
        await db.master_sk.delete(kode);
    },

    async getAllRecords() {
        try {
            return await db.sppd_records.orderBy('createdAt').reverse().toArray();
        } catch (err) {
            console.error("Error getAllRecords:", err);
            return [];
        }
    },

    async saveRecord(record) {
        await db.sppd_records.put(record);
        try {
            if (window.supabaseClient) {
                await supabaseClient.from('sppd_records').upsert([record]);
            }
        } catch (e) { console.warn("Sync Supabase offline:", e); }
    },

    async deleteRecord(id) {
        await db.sppd_records.delete(id);
        try {
            if (window.supabaseClient) {
                await supabaseClient.from('sppd_records').delete().eq('id', id);
            }
        } catch (e) { console.warn("Sync Supabase offline:", e); }
    }
};
