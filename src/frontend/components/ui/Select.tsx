'use client';

import React, {
  SelectHTMLAttributes,
  forwardRef,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
  badge?: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
  searchable?: boolean;
  value?: string | number;
  defaultValue?: string | number;
}

/**
 * Normaliza texto eliminando acentos y convirtiendo a minúsculas para búsquedas flexibles
 */
function normalizeText(text: string): string {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Distancia Levenshtein para tolerancia a pequeñas erratas
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Búsqueda flexible aproximada
 */
function fuzzyMatch(target: string, query: string): boolean {
  if (!query) return true;
  const nTarget = normalizeText(target);
  const nQuery = normalizeText(query);

  if (nTarget.includes(nQuery)) return true;

  const tokens = nQuery.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((tok) => nTarget.includes(tok))) {
    return true;
  }

  let targetIdx = 0;
  let queryIdx = 0;
  while (targetIdx < nTarget.length && queryIdx < nQuery.length) {
    if (nTarget[targetIdx] === nQuery[queryIdx]) {
      queryIdx++;
    }
    targetIdx++;
  }
  if (queryIdx === nQuery.length) return true;

  if (nQuery.length >= 4) {
    const words = nTarget.split(/\s+/);
    for (const w of words) {
      if (Math.abs(w.length - nQuery.length) <= 2) {
        const slice = w.slice(0, nQuery.length);
        if (levenshteinDistance(slice, nQuery) <= 1) {
          return true;
        }
      }
    }
  }

  return false;
}

function fuzzyMatchOption(opt: SelectOption, query: string): boolean {
  if (!query) return true;
  if (fuzzyMatch(opt.label, query)) return true;
  if (opt.badge && fuzzyMatch(opt.badge, query)) return true;
  if (opt.sublabel && fuzzyMatch(opt.sublabel, query)) return true;
  return false;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      placeholder = 'Seleccionar...',
      searchable = true,
      className,
      id,
      name,
      value: controlledValue,
      defaultValue,
      disabled,
      required,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const [internalValue, setInternalValue] = useState<string | number>(() => {
      if (controlledValue !== undefined) return controlledValue;
      if (defaultValue !== undefined) return defaultValue;
      return '';
    });

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const setRefs = useCallback(
      (element: HTMLSelectElement | null) => {
        hiddenSelectRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLSelectElement | null>).current = element;
        }
      },
      [ref]
    );

    useEffect(() => {
      if (isControlled) {
        setInternalValue(controlledValue ?? '');
      }
    }, [controlledValue, isControlled]);

    // Filtrar opciones ficticias vacías como "Seleccionar..." del desplegable
    const validOptions = useMemo(() => {
      return options.filter(
        (opt) => String(opt.value) !== '' && !/^seleccionar/i.test(opt.label)
      );
    }, [options]);

    // Opción actualmente seleccionada
    const selectedOption = useMemo(() => {
      return options.find((opt) => String(opt.value) === String(currentValue));
    }, [options, currentValue]);

    // Opciones filtradas dinámicamente con soporte de scroll amplio
    const displayedOptions = useMemo(() => {
      let filtered = validOptions;
      if (searchTerm.trim()) {
        filtered = validOptions.filter((opt) => fuzzyMatchOption(opt, searchTerm));
      } else if (currentValue !== '' && currentValue !== undefined) {
        const selected = validOptions.find((opt) => String(opt.value) === String(currentValue));
        const others = validOptions.filter((opt) => String(opt.value) !== String(currentValue));
        filtered = selected ? [selected, ...others] : validOptions;
      }
      return filtered.slice(0, 50);
    }, [validOptions, searchTerm, currentValue]);

    // Cerrar al hacer clic fuera
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setIsTyping(false);
          setSearchTerm('');
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const handleSelectOption = (option: SelectOption) => {
      if (option.disabled) return;

      const newValue = option.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }

      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = String(newValue);
        const nativeEvent = new Event('change', { bubbles: true });
        hiddenSelectRef.current.dispatchEvent(nativeEvent);
      }

      if (onChange) {
        const syntheticEvent = {
          target: { name: name || selectId, value: newValue },
          currentTarget: { name: name || selectId, value: newValue },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }

      setIsTyping(false);
      setSearchTerm('');
      setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValue('');
      }
      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = '';
        const nativeEvent = new Event('change', { bubbles: true });
        hiddenSelectRef.current.dispatchEvent(nativeEvent);
      }
      if (onChange) {
        const syntheticEvent = {
          target: { name: name || selectId, value: '' },
          currentTarget: { name: name || selectId, value: '' },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
      setIsTyping(false);
      setSearchTerm('');
      setIsOpen(true);
      textInputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setIsTyping(false);
        setSearchTerm('');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev < displayedOptions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayedOptions.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < displayedOptions.length) {
          handleSelectOption(displayedOptions[activeIndex]);
        }
      }
    };

    // Texto visible del input
    const displayValue = isTyping
      ? searchTerm
      : selectedOption && String(selectedOption.value) !== ''
      ? selectedOption.badge
        ? `${selectedOption.badge} · ${selectedOption.label}`
        : selectedOption.label
      : '';

    return (
      <div ref={containerRef} className="w-full flex flex-col gap-1.5 relative">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select nativo oculto para compatibilidad con formularios y React Hook Form */}
        <select
          ref={setRefs}
          id={selectId}
          name={name}
          value={currentValue !== undefined && currentValue !== null ? String(currentValue) : ''}
          required={required}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onBlur={onBlur}
          onChange={() => {}}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Input Text Combobox Buscable Directo */}
        <div className="relative w-full flex items-center">
          <input
            ref={textInputRef}
            type="text"
            autoComplete="off"
            disabled={disabled}
            placeholder={placeholder}
            value={displayValue}
            onFocus={() => {
              if (!disabled) {
                setIsOpen(true);
                // Si ya tiene valor, seleccionar el texto al enfocar para escribir directo
                if (textInputRef.current) {
                  textInputRef.current.select();
                }
              }
            }}
            onClick={() => {
              if (!disabled) setIsOpen(true);
            }}
            onChange={(e) => {
              if (searchable) {
                setIsTyping(true);
                setSearchTerm(e.target.value);
                setIsOpen(true);
                setActiveIndex(0);
              }
            }}
            onKeyDown={handleKeyDown}
            readOnly={!searchable}
            className={twMerge(
              clsx(
                'w-full pl-3 pr-16 py-2 text-xs sm:text-sm rounded-lg border transition-all bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : isOpen
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600',
                disabled && 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800',
                className
              )
            )}
          />

          {/* Iconos de acción en la esquina derecha del input */}
          <div className="absolute right-2.5 flex items-center gap-1 text-slate-400 pointer-events-none">
            {(currentValue !== '' && currentValue !== undefined && !disabled) || searchTerm ? (
              <button
                type="button"
                onClick={handleClear}
                tabIndex={-1}
                className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 pointer-events-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Limpiar selección"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (!disabled) {
                  setIsOpen(!isOpen);
                  if (!isOpen) textInputRef.current?.focus();
                }
              }}
              tabIndex={-1}
              className="p-0.5 pointer-events-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <ChevronDown
                className={clsx(
                  'w-4 h-4 transition-transform duration-200',
                  isOpen && 'rotate-180 text-blue-500'
                )}
              />
            </button>
          </div>
        </div>

        {/* Dropdown flotante con scroll suave y opciones estructuradas */}
        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col animate-scaleUp">
            <div
              ref={listRef}
              role="listbox"
              className="p-1 divide-y divide-slate-100/60 dark:divide-slate-800/40 max-h-56 overflow-y-auto"
            >
              {displayedOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  Sin coincidencias
                </div>
              ) : (
                displayedOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(currentValue);
                  const isActive = idx === activeIndex;

                  return (
                    <div
                      key={String(opt.value)}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectOption(opt)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={clsx(
                        'px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors select-none',
                        opt.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                          : isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {opt.badge && (
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shrink-0">
                            {opt.badge}
                          </span>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                            {opt.label}
                          </span>
                          {opt.sublabel && (
                            <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                              {opt.sublabel}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {validOptions.length > displayedOptions.length && (
              <div className="px-3 py-1 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50/60 dark:bg-slate-800/30 text-center border-t border-slate-100 dark:border-slate-800/60 select-none">
                Escribe para filtrar más ({validOptions.length} disponibles)
              </div>
            )}
          </div>
        )}

        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
