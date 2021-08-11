PLUGIN_TS=.¥node_modules¥.bin¥protoc-gen-ts
PLUGIN_GRPC=.¥node_modules¥.bin¥grpc_tools_node_protoc_plugin
DIST_DIR=.¥src¥protos

protoc --js_out=import_style=commonjs,binary:".¥src¥protos"¥ --ts_out=import_style=commonjs,binary:".¥src¥protos"¥ --grpc_out=".¥src¥protos"¥ --plugin=protoc-gen-grpc=".¥node_modules¥.bin¥grpc_tools_node_protoc_plugin" --plugin=protoc-gen-ts=".¥node_modules¥.bin¥protoc-gen-ts" --proto_path=.¥protos¥ -I .¥src¥protos .¥protos¥gtfs-realtime.proto

protoc --plugin="protoc-gen-ts=.¥node_modules¥.bin¥protoc-gen-ts.cmd" --js_out="import_style=commonjs,binary:." --ts_out="." .¥src¥protos¥gtfs-realtime.proto
