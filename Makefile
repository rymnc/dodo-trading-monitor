e2e_test:
	docker-compose up -d --build
	sleep 2
	yarn test
	docker-compose down
