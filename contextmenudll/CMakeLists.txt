cmake_minimum_required(VERSION 3.14)
project(ContextMenuDLL LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
add_compile_options(/utf-8)

# 编译为 DLL，并设定输出名称 contextmenudll.dll
add_library(contextmenudll SHARED ExplorerCommand.cpp)
set_target_properties(contextmenudll PROPERTIES OUTPUT_NAME "contextmenudll")

target_compile_definitions(contextmenudll PRIVATE -DUNICODE -D_UNICODE)

# 链接必要库
target_link_libraries(contextmenudll PRIVATE
    shlwapi
    ole32
    oleaut32
    uuid
)