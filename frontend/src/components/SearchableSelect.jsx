import React, { useState, useEffect, useRef } from 'react';
import { IoChevronDownOutline, IoSearchOutline, IoCloseOutline } from 'react-icons/io5';

const SearchableSelect = ({ options, value, onChange, placeholder = "Select...", label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    // Get the selected label from the value
    const selectedOption = options.find(opt => opt.value === value);
    const selectedLabel = selectedOption ? selectedOption.label : "";

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Handle initial value if it's external
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("");
        }
    }, [isOpen]);


    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

            <div
                className={`w-full px-4 py-3 border rounded-xl bg-white flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-[#ff4d2d] ring-2 ring-[#ff4d2d]/20' : 'border-gray-200 hover:border-gray-300'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-500'}`}>
                    {selectedLabel || placeholder}
                </span>
                <IoChevronDownOutline className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-100 top-full">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#ff4d2d] focus:ring-1 focus:ring-[#ff4d2d]"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                        <div className="p-1">
                            <div
                                className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${!value ? 'bg-orange-50 text-[#ff4d2d] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                onClick={(e) => { e.stopPropagation(); handleSelect({ value: "", label: placeholder }); }}
                            >
                                -- Tất cả --
                            </div>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${value === option.value
                                                ? 'bg-orange-50 text-[#ff4d2d] font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Stop click from closing dropdown immediately via outside click logic
                                            handleSelect(option);
                                        }}
                                    >
                                        {option.label}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                    Không tìm thấy kết quả
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
