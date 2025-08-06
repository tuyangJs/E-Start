cmake_minimum_required(VERSION 3.15)
project(ContextMenuDll LANGUAGES CXX)

# 查找 midl.exe: 使用用户预先设置的 MIDL_PATH
find_program(MIDL_COMPILER
    NAMES midl.exe
    PATHS ${MIDL_PATH}
)
if(NOT MIDL_COMPILER)
    message(FATAL_ERROR "未找到 midl.exe。请在系统环境变量中设置 MIDL_PATH 指向 midl.exe 所在目录，如：
	C:/Program Files (x86)/Windows Kits/10/Bin/10.0.xxx.0/x64")
endif()

# 设置生成目录
set(IDL_FILE       ${CMAKE_CURRENT_SOURCE_DIR}/src/ContextMenu.idl)
set(IDL_OUT_DIR    ${CMAKE_BINARY_DIR}/generated)
set(GEN_HEADER     ${IDL_OUT_DIR}/ContextMenu_h.h)
set(GEN_C          ${IDL_OUT_DIR}/ContextMenu_i.c)

# 创建生成目录
file(MAKE_DIRECTORY ${IDL_OUT_DIR})

# 添加 custom command: 用 midl 生成头和源
add_custom_command(
    OUTPUT ${GEN_HEADER} ${GEN_C}
    COMMAND ${MIDL_COMPILER}
            /nologo
            /win32
            /target "NT100"
            /out "${IDL_OUT_DIR}"
            "${IDL_FILE}"
    DEPENDS ${IDL_FILE}
    COMMENT "[MIDL] Generating files from ${IDL_FILE}"
)

# 添加库 target
add_library(contextmenudll SHARED
    src/ContextMenuCommand.cpp
    src/ContextMenuCommand.h
    ${GEN_HEADER}
    ${GEN_C}
)

# 定义一个生成 IDL 文件的虚拟目标，用于正确建立依赖关系
add_custom_target(generate_idl
    DEPENDS ${GEN_HEADER} ${GEN_C}
)

# 确保 contextmenudll 在构建前运行 generate_idl
add_dependencies(contextmenudll generate_idl)

# 包含生成目录
target_include_directories(contextmenudll PRIVATE ${IDL_OUT_DIR} src)

# 添加UTF-8编译选项以解决C4819警告
target_compile_options(contextmenudll PRIVATE "/utf-8")

# 链接系统库
target_link_libraries(contextmenudll
    ole32
    oleaut32
    shlwapi
    shell32
)

# 输出 DLL 到 Release 目录
set_target_properties(contextmenudll PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/Release"
    OUTPUT_NAME "contextmenudll"
)

# END CMakeLists.txt 示例
set_target_properties(contextmenudll PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/Release"
    OUTPUT_NAME "contextmenudll"
)