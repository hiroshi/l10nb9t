define USAGE
USAGE:
  make dev_server # run development http server for <script src="...">
endef
export USAGE

all:
	@echo "$$USAGE"

dev_server:
	ruby -rsinatra -e 'set :public_folder, "."; set :static_cache_control, "no-store"' -- -p 3000 -o 0.0.0.0
