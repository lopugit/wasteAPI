module.exports = {
  apps : [
		{
			name: 'wasteAPI',
			script: 'api/index.js',
			instances: 1,
			autorestart: true,
			watch: 'api/',
			max_memory_restart: '1G',
		}
	]
};
