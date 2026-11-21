/*
  ====================================================================================
  Nama Aplikasi : Sistem e - SPPD Terpadu - Dinas Pendidikan, Kepemudaan dan Olahraga
  Hosting       : GitHub Pages (Murni Single Page Application / SPA)
  Backend / DB  : Supabase REST API & Dexie IndexedDB (Offline-First)
  Nama Halaman  : js/db.js
  ====================================================================================
*/

const SUPABASE_URL = 'https://qhflpzinfgpspjmjfgjd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZmxwemluZmdwc3BqbWpmZ2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1OTQ0MDcsImV4cCI6MjExMDE3MDQwN30.nNRlb7T-Ps66AtkA2XtmV09ArcXZrkiJYGV0Zvh9Whc';

let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Versi 2: Menyelaraskan indeks created_at dengan skema PostgreSQL Supabase
const db = new Dexie('SPPD_PKO_DB');
db.version(2).stores({
    master_pelaksana: 'nip, nama, pangkat, jabatan',
    master_sk: 'kode, nama, quota',
    sppd_records: 'id, noSuratTugas, noSPPD, kodeSK, namaPelaksana, created_at'
});

window.AppDB = {
    getPublicStorageUrl(fileName) {
        if (!fileName) return '';
        return `${SUPABASE_URL}/storage/v1/object/public/gambar/${fileName}`;
    },

    async getMasterAsn() {
        try {
            let list = await db.master_pelaksana.toArray();
            if (supabaseClient && navigator.onLine) {
                const { data, error } = await supabaseClient.from('master_pelaksana').select('*');
                if (error) {
                    console.error("Gagal mengambil master_pelaksana:", error);
                } else if (Array.isArray(data) && data.length > 0) {
                    await db.master_pelaksana.bulkPut(data);
                    list = data;
                }
            }
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
            return await db.master_pelaksana.toArray();
        }
    },

    async saveMasterAsn(asn) {
        await db.master_pelaksana.put(asn);
        if (supabaseClient && navigator.onLine) {
            const { error } = await supabaseClient.from('master_pelaksana').upsert([asn], { onConflict: 'nip' });
            if (error) console.error("Sync Supabase master_pelaksana error:", error);
        }
    },

    async bulkSaveMasterAsn(list) {
        const cleanList = (Array.isArray(list) ? list : [])
            .map(item => ({
                nip: String(item.nip ?? '').trim(),
                nama: String(item.nama ?? '').trim(),
                pangkat: String(item.pangkat ?? '').trim(),
                jabatan: String(item.jabatan ?? '').trim()
            }))
            .filter(item => item.nip !== '' && item.nip !== '-' && item.nama !== '');

        if (cleanList.length === 0) return { ok: false, count: 0 };

        await db.master_pelaksana.bulkPut(cleanList);

        if (supabaseClient && navigator.onLine) {
            const { data, error } = await supabaseClient
                .from('master_pelaksana')
                .upsert(cleanList, { onConflict: 'nip' })
                .select();

            if (error) {
                console.error("Gagal upsert master_pelaksana ke Supabase:", error);
                return { ok: false, error, count: cleanList.length };
            }
            return { ok: true, data, count: cleanList.length };
        }
        return { ok: true, count: cleanList.length };
    },

    async deleteMasterAsn(nip) {
        await db.master_pelaksana.delete(nip);
        if (supabaseClient && navigator.onLine) {
            const { error } = await supabaseClient.from('master_pelaksana').delete().eq('nip', nip);
            if (error) console.error("Delete master_pelaksana error:", error);
        }
    },

    async getMasterSK() {
        try {
            let list = await db.master_sk.toArray();
            if (supabaseClient && navigator.onLine) {
                const { data, error } = await supabaseClient.from('master_sk').select('*');
                if (!error && Array.isArray(data) && data.length > 0) {
                    await db.master_sk.bulkPut(data);
                    list = data;
                }
            }
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
            return await db.master_sk.toArray();
        }
    },

    async saveMasterSK(sk) {
        await db.master_sk.put(sk);
        if (supabaseClient && navigator.onLine) {
            const { error } = await supabaseClient.from('master_sk').upsert([sk], { onConflict: 'kode' });
            if (error) console.error("Sync master_sk error:", error);
        }
    },

    async deleteMasterSK(kode) {
        await db.master_sk.delete(kode);
        if (supabaseClient && navigator.onLine) {
            const { error } = await supabaseClient.from('master_sk').delete().eq('kode', kode);
            if (error) console.error("Delete master_sk error:", error);
        }
    },

    async getAllRecords() {
        try {
            let records = await db.sppd_records.orderBy('created_at').reverse().toArray();

            if (supabaseClient && navigator.onLine) {
                const { data, error } = await supabaseClient
                    .from('sppd_records')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Gagal mengambil sppd_records dari Supabase:", error);
                } else if (Array.isArray(data)) {
                    // Sinkronkan cache lokal dengan data terbaru dari server
                    await db.sppd_records.clear();
                    if (data.length > 0) {
                        await db.sppd_records.bulkPut(data);
                    }
                    records = data;
                }
            }
            return records;
        } catch (err) {
            console.error("Error getAllRecords:", err);
            return await db.sppd_records.toArray();
        }
    },

    async saveRecord(record) {
        // Simpan ke IndexedDB lokal terlebih dahulu (Offline-First)
        await db.sppd_records.put(record);

        if (supabaseClient && navigator.onLine) {
            const { data, error } = await supabaseClient
                .from('sppd_records')
                .upsert([record], { onConflict: 'id' })
                .select();

            if (error) {
                console.error("Gagal menyimpan sppd_records ke Supabase:", error);
                return { ok: false, error };
            }
            return { ok: true, data };
        }
        return { ok: true, offline: true };
    },

    async deleteRecord(id) {
        await db.sppd_records.delete(id);
        if (supabaseClient && navigator.onLine) {
            const { error } = await supabaseClient.from('sppd_records').delete().eq('id', id);
            if (error) console.error("Gagal menghapus sppd_records di Supabase:", error);
        }
    }
};
