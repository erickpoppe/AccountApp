"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBankAccountTransactions = void 0;
const R = require("ramda");
const moment = require("moment");
const lodash_1 = require("lodash");
const _constants_1 = require("./_constants");
const FinancialSheet_1 = require("../../../FinancialStatements/common/FinancialSheet");
const _utils_1 = require("./_utils");
const running_balance_1 = require("../../../../utils/running-balance");
class GetBankAccountTransactions extends FinancialSheet_1.FinancialSheet {
    constructor(repo, query, i18n) {
        super();
        this.transactionNode = (transaction) => {
            const status = this.getTransactionStatus(transaction);
            const uncategorizedTransactionId = this.getUncategorizedTransId(transaction);
            const uncategorizedTrans = this.repo.uncategorizedTransactionsMapByRef.get(`${transaction.referenceType}-${transaction.referenceId}`);
            return {
                date: transaction.date,
                formattedDate: moment(transaction.date).format('YYYY-MM-DD'),
                withdrawal: transaction.credit,
                deposit: transaction.debit,
                formattedDeposit: this.formatNumber(transaction.debit),
                formattedWithdrawal: this.formatNumber(transaction.credit),
                referenceId: transaction.referenceId,
                referenceType: transaction.referenceType,
                formattedTransactionType: this.i18n.t(transaction.referenceTypeFormatted),
                transactionNumber: transaction.transactionNumber,
                referenceNumber: transaction.referenceNumber,
                description: (uncategorizedTrans || [])[0]?.description || '',
                runningBalance: this.runningBalance.amount(),
                formattedRunningBalance: this.formatNumber(this.runningBalance.amount()),
                balance: 0,
                formattedBalance: '',
                status,
                formattedStatus: (0, _utils_1.formatBankTransactionsStatus)(status),
                uncategorizedTransactionId,
            };
        };
        this.transactionRunningBalance = (transaction) => {
            const amount = transaction.deposit - transaction.withdrawal;
            const biggerThanZero = R.lt(0, amount);
            const lowerThanZero = R.gt(0, amount);
            const absAmount = Math.abs(amount);
            R.when(R.always(biggerThanZero), this.runningBalance.decrement)(absAmount);
            R.when(R.always(lowerThanZero), this.runningBalance.increment)(absAmount);
            const runningBalance = this.runningBalance.amount();
            return {
                ...transaction,
                runningBalance,
                formattedRunningBalance: this.formatNumber(runningBalance),
            };
        };
        this.transactionBalance = (transaction) => {
            const balance = transaction.runningBalance +
                transaction.withdrawal * -1 +
                transaction.deposit;
            return {
                ...transaction,
                balance,
                formattedBalance: this.formatNumber(balance),
            };
        };
        this.transactionTransformer = (transaction) => {
            return R.compose(this.transactionBalance, this.transactionRunningBalance, this.transactionNode)(transaction);
        };
        this.transactionsNode = (transactions) => {
            return R.map(this.transactionTransformer)(transactions);
        };
        this.repo = repo;
        this.query = query;
        this.i18n = i18n;
        this.runningBalance = (0, running_balance_1.runningBalance)(this.repo.openingBalance);
    }
    getTransactionStatus(transaction) {
        const categorizedTrans = this.repo.uncategorizedTransactionsMapByRef.get(`${transaction.referenceType}-${transaction.referenceId}`);
        const matchedTrans = this.repo.matchedBankTransactionsMapByRef.get(`${transaction.referenceType}-${transaction.referenceId}`);
        if (!(0, lodash_1.isEmpty)(categorizedTrans)) {
            return _constants_1.BankTransactionStatus.Categorized;
        }
        else if (!(0, lodash_1.isEmpty)(matchedTrans)) {
            return _constants_1.BankTransactionStatus.Matched;
        }
        else {
            return _constants_1.BankTransactionStatus.Manual;
        }
    }
    getUncategorizedTransId(transaction) {
        const categorizedTrans = this.repo.uncategorizedTransactionsMapByRef.get(`${transaction.referenceType}-${transaction.referenceId}`);
        const matchedTrans = this.repo.matchedBankTransactionsMapByRef.get(`${transaction.referenceType}-${transaction.referenceId}`);
        const firstCategorizedTrans = (0, lodash_1.first)(categorizedTrans);
        const firstMatchedTrans = (0, lodash_1.first)(matchedTrans);
        return (firstCategorizedTrans?.id ||
            firstMatchedTrans?.uncategorizedTransactionId ||
            null);
    }
    reportData() {
        return this.transactionsNode(this.repo.transactions);
    }
}
exports.GetBankAccountTransactions = GetBankAccountTransactions;
//# sourceMappingURL=GetBankAccountTransactions.js.map