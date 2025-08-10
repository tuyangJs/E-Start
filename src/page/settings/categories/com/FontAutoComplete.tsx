import React, { useEffect, useMemo, useRef, useState } from "react";
import { AutoComplete, Input, Spin } from "antd";
import type { AutoCompleteProps } from "antd";
import { invoke } from '@tauri-apps/api/core';
type FontOption = {
    value: string;
    label: React.ReactNode;
};

export interface FontAutoCompleteProps {
    placeholder?: string;
    maxOptions?: number; // 为性能考虑，最多显示多少项
    onChange?: AutoCompleteProps['onChange'];
    onSelectFont?: (fontName: string) => void;
    defaultValue?: string;
}

export default function FontAutoComplete({
    placeholder = "选择或搜索字体",
    maxOptions = 500,
    onSelectFont,
    onChange,
    defaultValue = "程序默认",
}: FontAutoCompleteProps) {
    const [fonts, setFonts] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(defaultValue);
    const [loading, setLoading] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        setLoading(true);
        invoke<string[]>("list_system_fonts")
            .then((list) => {
                if (!mountedRef.current) return;
                // 清洗：trim、剔除以 @ 开头、去重、按本地排序
                const cleaned = Array.from(
                    new Set(list.map((s) => s.trim()).filter((s) => s && !s.startsWith("@")))
                ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
                setFonts(cleaned);
            })
            .catch((e) => {
                console.error("list_system_fonts 调用失败", e);
                setFonts([]);
            })
            .finally(() => {
                if (mountedRef.current) setLoading(false);
            });

        return () => {
            mountedRef.current = false;
        };
    }, []);

    // 模糊搜索（简单 substring，忽略大小写）
    const filteredFonts = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return fonts.slice(0, maxOptions);
        const out: string[] = [];
        // 先尽量把包含前缀的排在前面，然后再包含中间的
        for (const f of fonts) {
            const lf = f.toLowerCase();
            if (lf.startsWith(q)) out.push(f);
        }
        for (const f of fonts) {
            const lf = f.toLowerCase();
            if (!lf.startsWith(q) && lf.includes(q)) out.push(f);
        }
        return out.slice(0, maxOptions);
    }, [fonts, search, maxOptions]);

    const options: FontOption[] = useMemo(() => {
        filteredFonts.unshift("程序默认"); // 默认项放在第一位
        const mapped = filteredFonts.map((name) => ({
            value: name,
            label: (
                <div style={{ fontFamily: `"${name}", sans-serif`, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {name}
                </div>
            ),
        }));

        // 把默认项放在第一位
        return mapped;
    }, [filteredFonts]);

    const handleSelect: AutoCompleteProps<string>["onSelect"] = (value) => {
        if (onSelectFont) onSelectFont(value);
        setSearch(value);
        onChange?.(value); // 回调选中的字体
        // 选择后立即关闭
        setOpen(false);
    };
    return (
        <AutoComplete
            open={open}
            options={options}
            onSelect={handleSelect}
            defaultValue={defaultValue}
            style={{ width: 228 }}
            onSearch={(val) => {
                setSearch(val);
                // 如果输入内容不为空，保持展开；如果为空并失焦后，也可保持展开（由 open 控制）
                setOpen(true);
            }}
            onFocus={() => {
                // 获取焦点时自动展开并展示所有（或部分）字体
                setOpen(true);
                // 不自动清空搜索，保留用户已输入
            }}
            onBlur={() => {
                // 延迟收起，允许 onSelect 先触发（避免在点击选项时过早收起）
                setTimeout(() => setOpen(false), 120);
            }}
            placeholder={placeholder}
            filterOption={false} // 我们自己做过滤
        >
            <Input.Search
                suffix={loading ? <Spin size="small" /> : undefined}
                value={search}
                variant="filled"
                onChange={(e) => {
                    setSearch(e.target.value);
                }}
                allowClear
                onKeyDown={(e) => {
                    // 回车时如果有高亮选项，AutoComplete 会处理 onSelect
                    if (e.key === "Escape") {
                        setOpen(false);
                    }
                }}
            />
        </AutoComplete>
    );
}
