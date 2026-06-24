'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CloudinaryImage from '@/components/CloudinaryImage';
import ReraQRModal from './ReraQRModal';

export default function PropertyGallery({ images, property }) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isReraModalOpen, setIsReraModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages = useMemo(() => safeImages.slice(0, 5), [safeImages]);
  const remainingCount = Math.max(safeImages.length - 3, 0);

  useEffect(() => {
    if (!isViewerOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsViewerOpen(false);
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current - 1 + safeImages.length) % safeImages.length);
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current + 1) % safeImages.length);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isViewerOpen, safeImages.length]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const previousOverflow = document.body.style.overflow;
    if (isViewerOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isViewerOpen]);

  if (!safeImages.length) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="h-72 sm:h-96 lg:h-105 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-100 via-white to-slate-50 flex flex-col items-center justify-center text-slate-400 px-4 text-center">
          <span className="material-symbols-outlined text-6xl">image_not_supported</span>
          <p className="mt-4 text-xs font-black uppercase tracking-widest">No gallery uploaded yet</p>
          <p className="mt-2 text-[11px] font-bold text-slate-500">This listing is live while media is being verified.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span className="text-[11px] font-bold tracking-tight">0 Gallery Photos</span>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Media Awaited</span>
        </div>
      </div>
    );
  }

  const categoryLabel =
    property?.raw?.category
      ? String(property.raw.category).replace('_', ' ').toUpperCase()
      : 'PROPERTY';
  const typeLabel = property?.bhk && property?.bhk !== '-' ? `${property.bhk} BHK` : categoryLabel;
  const areaLabel = property?.area && property?.area !== 'N/A' ? `${property.area} sq.ft` : 'Area pending';
  const formatAreaChip = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return `${value.toLocaleString('en-IN')} sq.ft`;
    }

    const input = String(value).trim();
    if (!input) return '';

    const numeric = Number(input.replace(/[^\d.]/g, ''));
    if (Number.isFinite(numeric) && numeric > 0) {
      if (/sq\.?\s*ft/i.test(input)) return input;
      return `${numeric.toLocaleString('en-IN')} sq.ft`;
    }

    return input;
  };

  const formatCompactIndianPrice = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return '';

    const toFixedTrimmed = (amount) =>
      Number(amount.toFixed(2)).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });

    if (numeric >= 10000000) {
      return `${toFixedTrimmed(numeric / 10000000)} Cr`;
    }

    if (numeric >= 100000) {
      return `${toFixedTrimmed(numeric / 100000)} Lac`;
    }

    return numeric.toLocaleString('en-IN');
  };

  const rawPrice = Number.isFinite(Number(property?.priceValue)) && Number(property?.priceValue) > 0
    ? `${formatCompactIndianPrice(property.priceValue)}${property?.priceSuffix ? ` ${property.priceSuffix}` : ''}`
    : property?.price || property?.raw?.priceDisplay || property?.raw?.priceLabel || 'On request';

  const carpetAreaLabel =
    formatAreaChip(
      property?.raw?.carpetArea ||
      property?.raw?.carpetAreaSqft ||
      property?.raw?.area?.carpet ||
      property?.raw?.area?.carpetSqft ||
      property?.raw?.carpet?.area ||
      property?.raw?.carpet?.sqft ||
      property?.carpetArea
    ) || 'On request';

  const getPropertyAge = () => {
    const ageField = property?.raw?.age || property?.age;
    if (ageField) return String(ageField).trim();
    return 'On request';
  };

  const getBathrooms = () => {
    const bathrooms = property?.raw?.bathrooms || property?.bathrooms;
    if (bathrooms && Number.isFinite(Number(bathrooms))) {
      return `${bathrooms} Bathroom${Number(bathrooms) > 1 ? 's' : ''}`;
    }
    return 'On request';
  };

  const getCoveredParking = () => {
    const parking = property?.raw?.parking || property?.parking;
    if (parking && Number.isFinite(Number(parking))) {
      return `${parking} Covered Parking${Number(parking) > 1 ? 's' : ''}`;
    }
    return 'On request';
  };

  const getPossessionStatus = () => {
    return property?.possession || property?.raw?.possession || 'Ready to Move';
  };

  const isCommercial = property?.raw?.category === 'commercial';
  const commercialType = property?.raw?.commercialType;
  const workstations = property?.raw?.workstations;
  const cabins = property?.raw?.cabins;
  const carParking = property?.raw?.carParking;
  const bikeParking = property?.raw?.bikeParking;
  const powerBackupKva = property?.raw?.powerBackupKva;
  const commercialTaxStatus = property?.raw?.commercialTaxStatus;
  const ocStatus = property?.raw?.ocStatus;

  const isRent = property?.raw?.category === 'rent';
  const reraId = property?.reraNumber || property?.raw?.reraNumber || '';
  const reraUrl = property?.reraUrl || property?.raw?.reraUrl || '';
  const qrData = reraUrl || reraId || property?.title || 'RERA';
  const reraStatus = property?.reraNumber || property?.raw?.reraNumber ? 'RERA verified' : 'RERA details pending';
  const openViewer = (index) => {
    setActiveIndex(index);
    setIsViewerOpen(true);
  };

  const currentImage = safeImages[activeIndex] || safeImages[0];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Split Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)] gap-3 sm:gap-4 h-auto lg:h-144">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative min-h-72 sm:min-h-88 lg:h-full rounded-2xl overflow-hidden group shadow-xl cursor-pointer"
          onClick={() => openViewer(0)}
        >
          <CloudinaryImage
            src={displayImages[0]}
            alt="Main Property View"
            fill
            eager
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent opacity-80 pointer-events-none" />
          {!isRent && <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsReraModalOpen(true);
            }}
            className="absolute left-3 sm:left-5 bottom-3 sm:bottom-5 z-10 flex items-center gap-2 bg-emerald-50/95 hover:bg-emerald-100 px-2.5 sm:px-3.5 py-2 rounded-xl border border-emerald-100 shadow-lg transition-all"
            aria-label="RERA View QR — open RERA verification"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center border border-emerald-50">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(qrData)}&color=059669`}
                alt="RERA QR"
                width={20}
                height={20}
                unoptimized
                className="w-4 h-4 sm:w-5 sm:h-5 opacity-70"
              />
            </div>
            <div className="leading-none text-left">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-emerald-600 text-[11px]">verified</span>
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-emerald-700 ">RERA</span>
              </div>
              <p className="text-[8px] font-bold text-emerald-700/80 uppercase">View QR</p>
            </div>
          </button>}
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-3 sm:gap-4 lg:h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative min-h-32 sm:min-h-44 lg:min-h-0 rounded-2xl overflow-hidden group shadow-md cursor-pointer border border-slate-100"
            onClick={() => openViewer(Math.min(1, safeImages.length - 1))}
          >
            <CloudinaryImage
              src={displayImages[1] || displayImages[0]}
              alt="Property Angle 2"
              fill
              sizes="(max-width: 1024px) 50vw, 30vw"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative min-h-32 sm:min-h-44 lg:min-h-0 rounded-2xl overflow-hidden group shadow-md cursor-pointer border border-slate-100"
            onClick={() => openViewer(Math.min(2, safeImages.length - 1))}
          >
            <CloudinaryImage
              src={displayImages[2] || displayImages[1] || displayImages[0]}
              alt="Property Gallery More"
              fill
              sizes="(max-width: 1024px) 50vw, 30vw"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white text-center px-4">
              {remainingCount > 0 ? (
                <>
                  <span className="text-3xl sm:text-4xl md:text-5xl font-heading font-black  tracking-tighter">+{remainingCount}</span>
                  <span className="mt-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-85">
                    Remaining Images
                  </span>
                </>
              ) : (
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-90">Open Gallery</span>
              )}
              <span className="mt-3 inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest bg-white/15 border border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                View All
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Property Info Chips */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Price</span>
          <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{rawPrice}</span>
        </div>
        <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Type</span>
          <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{typeLabel}</span>
        </div>
        <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Carpet Area</span>
          <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{carpetAreaLabel}</span>
        </div>
        <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Area</span>
          <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{areaLabel}</span>
        </div>
        <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Property Age</span>
          <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{getPropertyAge()}</span>
        </div>
        <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Bathrooms</span>
          <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{getBathrooms()}</span>
        </div>
        <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Covered Parking</span>
          <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{getCoveredParking()}</span>
        </div>
        <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Possession</span>
          <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{getPossessionStatus()}</span>
        </div>
        {isCommercial && commercialType && (
          <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Commercial Type</span>
            <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{commercialType}</span>
          </div>
        )}
        {isCommercial && commercialType === 'Office' && Number.isFinite(Number(workstations)) && (
          <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Workstations</span>
            <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{workstations}</span>
          </div>
        )}
        {isCommercial && commercialType === 'Office' && Number.isFinite(Number(cabins)) && (
          <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Cabins</span>
            <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{cabins}</span>
          </div>
        )}
        {isCommercial && (Number.isFinite(Number(carParking)) || Number.isFinite(Number(bikeParking))) && (
          <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Parking</span>
            <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">
              {[
                Number.isFinite(Number(carParking)) ? `${carParking} Car` : null,
                Number.isFinite(Number(bikeParking)) ? `${bikeParking} Bike` : null,
              ].filter(Boolean).join(' + ')}
            </span>
          </div>
        )}
        {isCommercial && Number.isFinite(Number(powerBackupKva)) && (
          <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Power Backup</span>
            <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{powerBackupKva} KVA</span>
          </div>
        )}
        {isCommercial && commercialTaxStatus && (
          <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">Commercial Tax</span>
            <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{commercialTaxStatus}</span>
          </div>
        )}
        {isCommercial && ocStatus && (
          <div className="group relative bg-white/30 backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl flex flex-col transition-all duration-300 hover:bg-white/40 hover:shadow-lg shadow-lg hover:shadow-blue-200/30">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at top right, rgba(47, 111, 237, 0.1), transparent)'}} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 relative z-10">OC Status</span>
            <span className="text-base sm:text-lg font-black text-slate-900 relative z-10 break-all">{ocStatus}</span>
          </div>
        )}
      </div>

      {isViewerOpen && (
        <div
          className="fixed inset-0 z-9999 bg-black/20 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsViewerOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsViewerOpen(false)}
              className="absolute -top-10 sm:-top-12 right-0 text-white/80 hover:text-white transition-colors"
              aria-label="Close gallery"
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl">close</span>
            </button>

            <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl border border-white/10 min-h-[52vh] sm:min-h-[60vh] lg:min-h-[72vh]">
              <div className="absolute inset-0 flex items-center justify-center">
                <CloudinaryImage
                  src={currentImage}
                  alt={`Gallery image ${activeIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain bg-black"
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current - 1 + safeImages.length) % safeImages.length)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/12 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current + 1) % safeImages.length)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/12 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>

              <div className="absolute left-3 sm:left-4 right-3 sm:right-4 top-3 sm:top-4 flex items-center justify-between gap-3 sm:gap-4">
                <div className="bg-black/45 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] backdrop-blur-md border border-white/10">
                  {activeIndex + 1} / {safeImages.length}
                </div>
                <div className="hidden md:flex items-center gap-2 bg-black/45 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
                  <span className="material-symbols-outlined text-[16px]">swipe</span>
                  Use arrows or tap thumbnails
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
              {safeImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative w-24 h-24 sm:w-30 sm:h-30 md:w-37.5 md:h-37.5 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border transition-all ${
                    index === activeIndex ? 'border-white ring-2 ring-white/70 scale-[1.02]' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <CloudinaryImage
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isRent && (
        <ReraQRModal
          isOpen={isReraModalOpen}
          onClose={() => setIsReraModalOpen(false)}
          reraId={reraId}
          reraUrl={reraUrl}
          propertyName={property?.title}
        />
      )}
    </div>
  );
}

