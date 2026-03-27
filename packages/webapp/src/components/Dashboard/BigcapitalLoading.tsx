// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import '@/style/components/BigcapitalLoading.scss';

export default function BigcapitalLoading({ className }) {
  return (
    <div className={classNames('bigcapital-loading', className)}>
      <div className="center">
        <img src="/fasthometax.png" height={80} alt="Fast Home Tax" />
      </div>
    </div>
  );
}
