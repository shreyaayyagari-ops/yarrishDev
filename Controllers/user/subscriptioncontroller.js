const Subscription = require('../../Models/Subscription');
const Settings = require('../../Models/settings');
const Order = require('../../Models/Order');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../Models/userModel');
const Subscribers = require('../../Models/subscriber');
// const payuConfig = require('../../Config/payUConfig');

module.exports = {
	get_plans: async (req, res) => {
		try {
			const token = req.headers.authorization.split(' ')[1];
			const user = jwt.verify(token, process.env.JWT_SECRET);
			const { id } = user;
			const userData = await User.findById(id).populate('country_id');
			const countryCode = userData.country_id.code; 

			const currencyMapping = {
				'+93': { code: 'AFN', symbol: '؋' }, // Afghanistan
				'+355': { code: 'ALL', symbol: 'L' }, // Albania
				'+213': { code: 'DZD', symbol: 'د.ج' }, // Algeria
				'+376': { code: 'EUR', symbol: '€' }, // Andorra
				'+244': { code: 'AOA', symbol: 'Kz' }, // Angola
				'+54': { code: 'ARS', symbol: '$' }, // Argentina
				'+374': { code: 'AMD', symbol: '֏' }, // Armenia
				'+61': { code: 'AUD', symbol: 'A$' }, // Australia
				'+43': { code: 'EUR', symbol: '€' }, // Austria
				'+994': { code: 'AZN', symbol: '₼' }, // Azerbaijan
				'+973': { code: 'BHD', symbol: '.د.ب' }, // Bahrain
				'+880': { code: 'BDT', symbol: '৳' }, // Bangladesh
				'+375': { code: 'BYN', symbol: 'Br' }, // Belarus
				'+32': { code: 'EUR', symbol: '€' }, // Belgium
				'+229': { code: 'XOF', symbol: 'CFA' }, // Benin
				'+975': { code: 'BTN', symbol: 'Nu.' }, // Bhutan
				'+591': { code: 'BOB', symbol: 'Bs.' }, // Bolivia
				'+267': { code: 'BWP', symbol: 'P' }, // Botswana
				'+55': { code: 'BRL', symbol: 'R$' }, // Brazil
				'+673': { code: 'BND', symbol: 'B$' }, // Brunei
				'+359': { code: 'BGN', symbol: 'лв' }, // Bulgaria
				'+226': { code: 'XOF', symbol: 'CFA' }, // Burkina Faso
				'+95': { code: 'MMK', symbol: 'K' }, // Myanmar
				'+257': { code: 'BIF', symbol: 'FBu' }, // Burundi
				'+855': { code: 'KHR', symbol: '៛' }, // Cambodia
				'+237': { code: 'XAF', symbol: 'CFA' }, // Cameroon
				'+1': { code: 'USD', symbol: '$' }, // Canada
				'+238': { code: 'CVE', symbol: 'Esc' }, // Cape Verde
				'+236': { code: 'XAF', symbol: 'CFA' }, // Central African Republic
				'+86': { code: 'CNY', symbol: '¥' }, // China
				'+57': { code: 'COP', symbol: '$' }, // Colombia
				'+243': { code: 'CDF', symbol: 'FC' }, // Congo (DRC)
				'+682': { code: 'NZD', symbol: 'NZ$' }, // Cook Islands
				'+506': { code: 'CRC', symbol: '₡' }, // Costa Rica
				'+385': { code: 'EUR', symbol: '€' }, // Croatia
				'+357': { code: 'EUR', symbol: '€' }, // Cyprus
				'+420': { code: 'CZK', symbol: 'Kč' }, // Czech Republic
				'+45': { code: 'DKK', symbol: 'kr' }, // Denmark
				'+253': { code: 'DJF', symbol: 'Fdj' }, // Djibouti
				'+20': { code: 'EGP', symbol: '£' }, // Egypt
				'+503': { code: 'USD', symbol: '$' }, // El Salvador
				'+240': { code: 'XAF', symbol: 'CFA' }, // Equatorial Guinea
				'+372': { code: 'EUR', symbol: '€' }, // Estonia
				'+251': { code: 'ETB', symbol: 'Br' }, // Ethiopia
				'+679': { code: 'FJD', symbol: 'FJ$' }, // Fiji
				'+33': { code: 'EUR', symbol: '€' }, // France
				'+49': { code: 'EUR', symbol: '€' }, // Germany
				'+233': { code: 'GHS', symbol: '₵' }, // Ghana
				'+30': { code: 'EUR', symbol: '€' }, // Greece
				'+502': { code: 'GTQ', symbol: 'Q' }, // Guatemala
				'+224': { code: 'GNF', symbol: 'FG' }, // Guinea
				'+592': { code: 'GYD', symbol: 'G$' }, // Guyana
				'+852': { code: 'HKD', symbol: 'HK$' }, // Hong Kong
				'+91': { code: 'INR', symbol: '₹' }, // India
				'+62': { code: 'IDR', symbol: 'Rp' }, // Indonesia
				'+98': { code: 'IRR', symbol: '﷼' }, // Iran
				'+964': { code: 'IQD', symbol: 'ع.د' }, // Iraq
				'+353': { code: 'EUR', symbol: '€' }, // Ireland
				'+972': { code: 'ILS', symbol: '₪' }, // Israel
				'+39': { code: 'EUR', symbol: '€' }, // Italy
				'+81': { code: 'JPY', symbol: '¥' }, // Japan
				'+254': { code: 'KES', symbol: 'KSh' }, // Kenya
				'+82': { code: 'KRW', symbol: '₩' }, // South Korea
				'+965': { code: 'KWD', symbol: 'KD' }, // Kuwait
				'+856': { code: 'LAK', symbol: '₭' }, // Laos
				'+371': { code: 'EUR', symbol: '€' }, // Latvia
				'+961': { code: 'LBP', symbol: 'ل.ل' }, // Lebanon
				'+60': { code: 'MYR', symbol: 'RM' }, // Malaysia
				'+230': { code: 'MUR', symbol: '₨' }, // Mauritius
				'+52': { code: 'MXN', symbol: '$' }, // Mexico
				'+31': { code: 'EUR', symbol: '€' }, // Netherlands
				'+64': { code: 'NZD', symbol: 'NZ$' }, // New Zealand
				'+47': { code: 'NOK', symbol: 'kr' }, // Norway
				'+92': { code: 'PKR', symbol: '₨' }, // Pakistan
				'+63': { code: 'PHP', symbol: '₱' }, // Philippines
				'+48': { code: 'PLN', symbol: 'zł' }, // Poland
				'+351': { code: 'EUR', symbol: '€' }, // Portugal
				'+7': { code: 'RUB', symbol: '₽' }, // Russia
				'+966': { code: 'SAR', symbol: 'ر.س' }, // Saudi Arabia
				'+27': { code: 'ZAR', symbol: 'R' }, // South Africa
				'+34': { code: 'EUR', symbol: '€' }, // Spain
				'+46': { code: 'SEK', symbol: 'kr' }, // Sweden
				'+41': { code: 'CHF', symbol: 'CHF' }, // Switzerland
				'+66': { code: 'THB', symbol: '฿' }, // Thailand
				'+90': { code: 'TRY', symbol: '₺' }, // Turkey
				'+44': { code: 'GBP', symbol: '£' }, // United Kingdom
				'+1': { code: 'USD', symbol: '$' }, // United States
				'+84': { code: 'VND', symbol: '₫' }, // Vietnam
				'+260': { code: 'ZMW', symbol: 'ZK' }, // Zambia
			};

			const currency = currencyMapping[countryCode] || { code: 'USD', symbol: '$' }; 
			const subscriptions = await Subscription.find({ status: 'Active' })
				.select(['name', 'days', 'price', 'discount', 'status']);

			return res.status(200).json({
				data: subscriptions.map(subscription => ({
					...subscription.toObject(), 
					price: subscription.price.toString(), 
					currency: currency.code,
					symbol: currency.symbol
				})),
				currency: currency.code,
				symbol: currency.symbol
			});
		} catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
	},

	getSubscriptionById: async (req, res) => {
		try {
			const serviceProviderId = req.userId
			const { id } = req.params;
			const subscription = await Subscription.findById(id);
			if (!subscription) {
				return res.status(404).json({ message: 'Subscription not found' });
			}
			const serviceProvider = await User.findById(serviceProviderId);
			if (!serviceProvider) {
				return res.status(404).json({ message: 'Service provider not found' });
			}
			serviceProvider.subscribed = true;
			await serviceProvider.save();
			return res.status(200).json({
				message: 'Subscription Retrived',
				subscriptionDetails: subscription,
			});
		} catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
	},

	viewWallet: async (req, res) => {
		try {
			const userId = req.userId
			const userdata = await User.findById(userId);
			if (!userdata) {
				return res.status(404).json({ message: "User not found" });
			}
			res.status(200).json({
				walletBalance: userdata.wallet,
				transactions: userdata.walletTransactions,
			});
		} catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
	},

	initiatePayment: async (req, res) => {
		try {
			const baseUrl = `${req.protocol}://${req.get('host')}`;
			const { subscriptionId, referralCode } = req.body;
			const userId = req.userId;
			const userdata = await User.findById(userId).populate('country_id');
			if (!userdata) {
				return res.status(404).json({ message: "User not found" });
			}
			const country = userdata.country_id;
			const code = country?.code || '+1';
			const currencyMapping = {
				'+93': { code: 'AFN', symbol: '؋' }, // Afghanistan
				'+355': { code: 'ALL', symbol: 'L' }, // Albania
				'+213': { code: 'DZD', symbol: 'د.ج' }, // Algeria
				'+376': { code: 'EUR', symbol: '€' }, // Andorra
				'+244': { code: 'AOA', symbol: 'Kz' }, // Angola
				'+54': { code: 'ARS', symbol: '$' }, // Argentina
				'+374': { code: 'AMD', symbol: '֏' }, // Armenia
				'+61': { code: 'AUD', symbol: 'A$' }, // Australia
				'+43': { code: 'EUR', symbol: '€' }, // Austria
				'+994': { code: 'AZN', symbol: '₼' }, // Azerbaijan
				'+973': { code: 'BHD', symbol: '.د.ب' }, // Bahrain
				'+880': { code: 'BDT', symbol: '৳' }, // Bangladesh
				'+375': { code: 'BYN', symbol: 'Br' }, // Belarus
				'+32': { code: 'EUR', symbol: '€' }, // Belgium
				'+229': { code: 'XOF', symbol: 'CFA' }, // Benin
				'+975': { code: 'BTN', symbol: 'Nu.' }, // Bhutan
				'+591': { code: 'BOB', symbol: 'Bs.' }, // Bolivia
				'+267': { code: 'BWP', symbol: 'P' }, // Botswana
				'+55': { code: 'BRL', symbol: 'R$' }, // Brazil
				'+673': { code: 'BND', symbol: 'B$' }, // Brunei
				'+359': { code: 'BGN', symbol: 'лв' }, // Bulgaria
				'+226': { code: 'XOF', symbol: 'CFA' }, // Burkina Faso
				'+95': { code: 'MMK', symbol: 'K' }, // Myanmar
				'+257': { code: 'BIF', symbol: 'FBu' }, // Burundi
				'+855': { code: 'KHR', symbol: '៛' }, // Cambodia
				'+237': { code: 'XAF', symbol: 'CFA' }, // Cameroon
				'+1': { code: 'USD', symbol: '$' }, // Canada
				'+238': { code: 'CVE', symbol: 'Esc' }, // Cape Verde
				'+236': { code: 'XAF', symbol: 'CFA' }, // Central African Republic
				'+86': { code: 'CNY', symbol: '¥' }, // China
				'+57': { code: 'COP', symbol: '$' }, // Colombia
				'+243': { code: 'CDF', symbol: 'FC' }, // Congo (DRC)
				'+682': { code: 'NZD', symbol: 'NZ$' }, // Cook Islands
				'+506': { code: 'CRC', symbol: '₡' }, // Costa Rica
				'+385': { code: 'EUR', symbol: '€' }, // Croatia
				'+357': { code: 'EUR', symbol: '€' }, // Cyprus
				'+420': { code: 'CZK', symbol: 'Kč' }, // Czech Republic
				'+45': { code: 'DKK', symbol: 'kr' }, // Denmark
				'+253': { code: 'DJF', symbol: 'Fdj' }, // Djibouti
				'+20': { code: 'EGP', symbol: '£' }, // Egypt
				'+503': { code: 'USD', symbol: '$' }, // El Salvador
				'+240': { code: 'XAF', symbol: 'CFA' }, // Equatorial Guinea
				'+372': { code: 'EUR', symbol: '€' }, // Estonia
				'+251': { code: 'ETB', symbol: 'Br' }, // Ethiopia
				'+679': { code: 'FJD', symbol: 'FJ$' }, // Fiji
				'+33': { code: 'EUR', symbol: '€' }, // France
				'+49': { code: 'EUR', symbol: '€' }, // Germany
				'+233': { code: 'GHS', symbol: '₵' }, // Ghana
				'+30': { code: 'EUR', symbol: '€' }, // Greece
				'+502': { code: 'GTQ', symbol: 'Q' }, // Guatemala
				'+224': { code: 'GNF', symbol: 'FG' }, // Guinea
				'+592': { code: 'GYD', symbol: 'G$' }, // Guyana
				'+852': { code: 'HKD', symbol: 'HK$' }, // Hong Kong
				'+91': { code: 'INR', symbol: '₹' }, // India
				'+62': { code: 'IDR', symbol: 'Rp' }, // Indonesia
				'+98': { code: 'IRR', symbol: '﷼' }, // Iran
				'+964': { code: 'IQD', symbol: 'ع.د' }, // Iraq
				'+353': { code: 'EUR', symbol: '€' }, // Ireland
				'+972': { code: 'ILS', symbol: '₪' }, // Israel
				'+39': { code: 'EUR', symbol: '€' }, // Italy
				'+81': { code: 'JPY', symbol: '¥' }, // Japan
				'+254': { code: 'KES', symbol: 'KSh' }, // Kenya
				'+82': { code: 'KRW', symbol: '₩' }, // South Korea
				'+965': { code: 'KWD', symbol: 'KD' }, // Kuwait
				'+856': { code: 'LAK', symbol: '₭' }, // Laos
				'+371': { code: 'EUR', symbol: '€' }, // Latvia
				'+961': { code: 'LBP', symbol: 'ل.ل' }, // Lebanon
				'+60': { code: 'MYR', symbol: 'RM' }, // Malaysia
				'+230': { code: 'MUR', symbol: '₨' }, // Mauritius
				'+52': { code: 'MXN', symbol: '$' }, // Mexico
				'+31': { code: 'EUR', symbol: '€' }, // Netherlands
				'+64': { code: 'NZD', symbol: 'NZ$' }, // New Zealand
				'+47': { code: 'NOK', symbol: 'kr' }, // Norway
				'+92': { code: 'PKR', symbol: '₨' }, // Pakistan
				'+63': { code: 'PHP', symbol: '₱' }, // Philippines
				'+48': { code: 'PLN', symbol: 'zł' }, // Poland
				'+351': { code: 'EUR', symbol: '€' }, // Portugal
				'+7': { code: 'RUB', symbol: '₽' }, // Russia
				'+966': { code: 'SAR', symbol: 'ر.س' }, // Saudi Arabia
				'+27': { code: 'ZAR', symbol: 'R' }, // South Africa
				'+34': { code: 'EUR', symbol: '€' }, // Spain
				'+46': { code: 'SEK', symbol: 'kr' }, // Sweden
				'+41': { code: 'CHF', symbol: 'CHF' }, // Switzerland
				'+66': { code: 'THB', symbol: '฿' }, // Thailand
				'+90': { code: 'TRY', symbol: '₺' }, // Turkey
				'+44': { code: 'GBP', symbol: '£' }, // United Kingdom
				'+1': { code: 'USD', symbol: '$' }, // United States
				'+84': { code: 'VND', symbol: '₫' }, // Vietnam
				'+260': { code: 'ZMW', symbol: 'ZK' }, // Zambia
			};
			const currency = currencyMapping[code] || { code: 'USD', symbol: '$' };
			let referrer = null;
			if (referralCode) {
				referrer = await User.findOne({ referralCode });
				if (!referrer) {
					return res.status(400).json({ message: "Invalid referral code" });
				}
			}
			const subscription = await Subscription.findById(subscriptionId);
			if (!subscription) {
				return res.status(404).json({ message: "Subscription not found" });
			}
			const payuConfig = {
				merchantKey: '8606337',
				salt: 'BuoA4HAo4GIZ5AvMYRPVyFX80sDSrWxg',
				authUrl: 'https://test.payu.in/_payment', // Use sandbox URL for testing
			};
			const amount = subscription.price;
			const paymentAmount = '';
			const paymentSuccess = true;
			if (paymentSuccess) {
				if (referrer) {
					referrer.wallet += paymentAmount;
					referrer.walletTransactions.push({
						amount: paymentAmount,
						type: "credit",
						description: `Referral bonus for referral code ${userdata.referralCode}`,
						date: Date.now()
					});
					await referrer.save();
				}99
				userdata.wallet -= paymentAmount;
				userdata.walletTransactions.push({
					amount: paymentAmount,
					type: "debit",
					description: `Subscription payment for subscription ID ${subscriptionId}`,
					date: Date.now()
				});
				await userdata.save();
			}
			const txnId = `Txn${new Date().getTime()}`;

			const users = await User.findOne({ _id: userId });

			if (!users) {
				throw new Error('User not found');
			}

			const newOrder = await Order.create({
				userId,
				subscriptionId,
				ServiceProvidername: users.name,  
				ServiceProviderphone: users.phone,  
				txnId,
				amount,
				currency,
				status: 'pending',
			});
			const hashString = `${payuConfig.merchantKey}|${txnId}|${amount}|${subscription.name}|${userdata.name}|${userdata.email}|||||||||||${payuConfig.salt}`;
			const hash = crypto.createHash('sha512').update(hashString).digest('hex');

			const paymentData = {
				key: payuConfig.merchantKey,
				txnid: txnId,
				amount,
				productinfo: subscription.name,
				firstname: userdata.name,
				email: userdata.email,
				phone: userdata.phone.toString(),
				surl: `${baseUrl}/payu/success`,
				furl: `${baseUrl}/payu/failure`,
				hash,
				production: '1',
				currency: currency.code
			};
			return res.status(200).json({
				success: true,
				message: "Order created and payment initiated",
				orderId: newOrder._id,
				paymentGatewayData: paymentData,
			});
		} catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
	},

	paymentSuccess: async (req, res) => {
		try {
			const { txnid, status, hash } = req.body;

			if (!txnid || !status || !hash) {
				return res.status(400).send('Missing required fields!');
			}

			const payuConfig = {
				merchantKey: '8606337',
				salt: 'BuoA4HAo4GIZ5AvMYRPVyFX80sDSrWxg',
				authUrl: 'https://test.payu.in/_payment',
			};

			const hashString = `${payuConfig.salt}|${status}|||||||||||${txnid}|${payuConfig.merchantKey}`;
			const expectedHash = crypto.createHash('sha512').update(hashString).digest('hex');
			if (hash !== expectedHash) {
				return res.status(400).send('Invalid hash!');
			}

			const order = await Order.findOne({ txnId: txnid });
			if (!order) {
				return res.status(400).send('Payment validation failed: Order not found!');
			}

			if (status === 'success') {
				await Order.findByIdAndUpdate(order._id, { status: 'success' });

				const user = await User.findById(order.userId);
				if (!user) {
					return res.status(400).send('User not found!');
				}

				user.suvscription_status = true

				const subscription = await Subscription.findById(order.subscriptionId);
				if (!subscription) {
					return res.status(400).send('Subscription not found!');
				}

				const subscriptionDays = subscription.days;
				const currentDate = new Date();
				const subscriptionEnd = new Date(currentDate);
				subscriptionEnd.setDate(subscriptionEnd.getDate() + subscriptionDays);

				await User.findByIdAndUpdate(user._id, {
					subscription_status: true,
					subscription_end: subscriptionEnd,
				});

				const settings = await Settings.findOne({}, 'referalAmount').lean();
				const referralAmount = settings?.referalAmount || 0;
				const referrer = await User.findOne({ referralCode: user.referralCode });

				if (referralAmount > 0 && referrer) {
					referrer.wallet += referralAmount;
					referrer.walletTransactions.push({
						amount: referralAmount,
						type: "credit",
						description: `Referral bonus for referral code ${user.referralCode}`,
						date: Date.now(),
					});
					await referrer.save();
				}
				const subscriber = new Subscribers({
					user: user._id,
					serviceProvidername: order.ServiceProvidername,
					serviceProviderphone: order.ServiceProviderphone,
					subscription_Id: order.subscriptionId,
					order_Id: order.txnId,
					expiryDate: subscriptionEnd,
					status: 'Active',
					suvscription_status: true,
					paymentId,
					// user: screen_status = 'Proof_verification',
				});
				await subscriber.save();

				return res.status(200).send('Payment successful!');
			}

			return res.status(400).send('Payment not successful, status: ' + status);
		} catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
	}




	,
	// paymentfailure: async (req, res) => {
	// 	return res.status(400).send('Payment failed!');
	// },
}